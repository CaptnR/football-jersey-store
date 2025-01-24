from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from .models import Team, Player, Jersey, Customization, Order, Payment
from .serializers import TeamSerializer, PlayerSerializer, JerseySerializer, CustomizationSerializer, OrderSerializer, PaymentSerializer
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow public access
def signup_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if User.objects.filter(username=username).exists():
        return Response({'error': 'User already exists'}, status=400)
    user = User.objects.create_user(username=username, password=password)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow public access
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid password'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist'}, status=400)

class TeamViewSet(ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class PlayerViewSet(ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class JerseyViewSet(ModelViewSet):
    queryset = Jersey.objects.all()
    serializer_class = JerseySerializer
    permission_classes = []

class CustomizationViewSet(ModelViewSet):
    queryset = Customization.objects.all()
    serializer_class = CustomizationSerializer

class CheckoutView(APIView):
    authentication_classes = [TokenAuthentication]  # Ensure TokenAuthentication is used
    permission_classes = [IsAuthenticated]  # Ensure the view requires authentication

    def post(self, request):
        # Debug: Log the Authorization header
        print(f"Authorization header: {request.headers.get('Authorization')}")

        user = request.user  # Authenticated user
        cart_items = request.data.get('cart_items', [])
        total_price = request.data.get('total_price', 0.0)
        payment_data = request.data.get('payment', {})

        # Create an order
        order = Order.objects.create(user=user, total_price=total_price)

        # Create a payment linked to the order
        Payment.objects.create(
            order=order,
            name_on_card=payment_data.get('name_on_card'),
            card_number=payment_data.get('card_number'),
            expiration_date=payment_data.get('expiration_date'),
        )

        return Response({"message": "Order placed successfully!"}, status=status.HTTP_201_CREATED)