from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import CustomizationSerializer
from .models import Customization
import logging

logger = logging.getLogger(__name__)

class CustomizationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Log the incoming data
        logger.info(f"Received customization data: {request.data}")
        
        serializer = CustomizationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Customization saved successfully',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        # Enhanced error response
        logger.error(f"Validation errors: {serializer.errors}")
        return Response(
            {
                'success': False,
                'message': 'Invalid data provided',
                'errors': serializer.errors,
                'received_data': request.data  # Include the received data in the error response
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request):
        customizations = Customization.objects.filter(user=request.user)
        serializer = CustomizationSerializer(customizations, many=True)
        return Response(
            {
                'success': True,
                'data': serializer.data
            }
        ) 