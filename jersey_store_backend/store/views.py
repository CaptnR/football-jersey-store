from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import CustomizationSerializer, OrderSerializer
from .models import Customization, Order, OrderItem
import logging
from django.db import transaction

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

class OrderListView(APIView):
    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class OrderDetailView(APIView):
    def get(self, request, order_id):
        try:
            order = Order.objects.prefetch_related('items').get(id=order_id, user=request.user)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            with transaction.atomic():
                # Validate required data
                if not request.data.get('items'):
                    return Response({
                        'error': 'No items provided'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Create order
                order = Order.objects.create(
                    user=request.user,
                    total_price=request.data.get('total_price', 0),
                    status='processing'
                )

                # Create order items
                for item in request.data.get('items', []):
                    try:
                        OrderItem.objects.create(
                            order=order,
                            jersey_id=item['jersey_id'],
                            quantity=item['quantity'],
                            price=item['price'],
                            size=item.get('size', 'M'),
                            type=item.get('type', 'regular'),
                            player_name=item.get('player_name', '')
                        )
                    except KeyError as e:
                        raise ValueError(f"Missing required field: {str(e)}")

                # Return the created order
                serializer = OrderSerializer(order)
                return Response({
                    'message': 'Order created successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return Response({
                'error': 'Failed to create order'
            }, status=status.HTTP_400_BAD_REQUEST) 