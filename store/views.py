from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from .models import Team, Player, Jersey, Customization, Order, Payment, Wishlist
from .serializers import TeamSerializer, PlayerSerializer, JerseySerializer, CustomizationSerializer, UserOrderSerializer, AdminOrderSerializer
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.db import models
from .serializers import JerseySerializer
from .models import Jersey
from django.http import JsonResponse
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

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
            return Response({
                'token': token.key,
                'is_admin': user.is_staff  # Include admin status in the response
            })
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
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['player__name', 'player__team__name', 'player__team__league']  # Search by player name, team name or league
    filterset_fields = {
        'player__name': ['exact'],            # Filter by player name
        'player__team__name': ['exact'],      # Filter by team name
        'player__team__league': ['exact'],    # Filter by league
        'price': ['gte', 'lte'],              # Filter by price range
    }  # Filter by player, league, team, or price
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
    
# User Order Tracking
class UserOrderView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user must be authenticated

    def get(self, request):
        # Fetch orders for the currently logged-in user
        orders = Order.objects.filter(user=request.user)
        serializer = UserOrderSerializer(orders, many=True)
        return Response(serializer.data)

# Admin Order Management
class AdminOrderView(APIView):
    permission_classes = [IsAdminUser]  # Allow only admins to access this view

    def get(self, request):
        orders = Order.objects.all()  # Fetch all orders in the system
        serializer = AdminOrderSerializer(orders, many=True)  # Serialize all orders
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            status = request.data.get('status')
            if status not in dict(Order.STATUS_CHOICES):
                return Response({"error": "Invalid status"}, status=400)

            order.status = status
            order.save()
            return Response({"message": "Order status updated successfully"})
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

# Admin Dashboard        
class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]  # Only admins can access this view

    def get(self, request):
        total_sales = Order.objects.filter(status__in=['Shipped', 'Delivered']).aggregate(total=models.Sum('total_price'))['total'] or 0
        total_users = User.objects.count()
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='Pending').count()

        return Response({
            "total_sales": total_sales,
            "total_users": total_users,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
        })

# Recommended Jerseys        
class RecommendedJerseysView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            recommended_jerseys = Jersey.objects.order_by('?')[:5]
            serializer = JerseySerializer(recommended_jerseys, many=True, context={'request': request})  # Pass the request here
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in RecommendedJerseysView: {e}")
            return Response({'error': str(e)}, status=500)
        

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all wishlist items for the logged-in user."""
        wishlist_items = Wishlist.objects.filter(user=request.user).select_related('jersey')
        jerseys = [item.jersey for item in wishlist_items]
        serializer = JerseySerializer(jerseys, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        """Add a jersey to the user's wishlist."""
        jersey_id = request.data.get('jersey_id')
        if not jersey_id:
            return Response({'error': 'Jersey ID is required'}, status=400)

        try:
            Wishlist.objects.create(user=request.user, jersey_id=jersey_id)
            return Response({'message': 'Jersey added to wishlist'}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def delete(self, request):
        """Remove a jersey from the user's wishlist."""
        jersey_id = request.data.get('jersey_id')
        if not jersey_id:
            return Response({'error': 'Jersey ID is required'}, status=400)

        Wishlist.objects.filter(user=request.user, jersey_id=jersey_id).delete()
        return Response({'message': 'Jersey removed from wishlist'}, status=200)
        
class FilterMetadataView(APIView):
    def get(self, request):
        players = Jersey.objects.values_list('player__name', flat=True).distinct()
        leagues = Jersey.objects.values_list('player__team__league', flat=True).distinct()
        teams = Jersey.objects.values_list('player__team__name', flat=True).distinct()
        min_price = Jersey.objects.order_by('price').first().price
        max_price = Jersey.objects.order_by('-price').first().price

        return Response({
            'players': players,
            'leagues': leagues,
            'teams': teams,
            'price_range': {
                'min': min_price,
                'max': max_price,
            },
        })