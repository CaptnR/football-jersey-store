from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from .models import Team, Player, Jersey, Customization, Order, Payment, Wishlist, Review, Sale
from .serializers import TeamSerializer, PlayerSerializer, JerseySerializer, CustomizationSerializer, UserOrderSerializer, AdminOrderSerializer, OrderSerializer, ReviewSerializer, AdminJerseySerializer, SaleSerializer
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth.models import User
from django.db import models
from .serializers import JerseySerializer
from .models import Jersey
from django.http import JsonResponse
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework import serializers
from django.http import Http404
from contextlib import suppress
from django.core.cache import cache
from django.db.models import Prefetch
from django.db.models import Count, Avg, F
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

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
@permission_classes([AllowAny])
def login_user(request):
    try:
        # Add debug logging
        print("Login attempt with data:", request.data)
        
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=400)
            
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'is_admin': user.is_staff,
                    'username': user.username
                })
            return Response({
                'error': 'Invalid password'
            }, status=400)
        except User.DoesNotExist:
            return Response({
                'error': 'User does not exist'
            }, status=400)
            
    except Exception as e:
        print("Login error:", str(e))  # Add server-side error logging
        return Response({
            'error': 'Server error occurred'
        }, status=500)

class TeamViewSet(ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class PlayerViewSet(ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class JerseyViewSet(viewsets.ModelViewSet):
    queryset = Jersey.objects.all()
    serializer_class = JerseySerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['player__name', 'player__team__name', 'player__team__league']
    filterset_fields = ['player__team__league', 'player__team__name']

    def get_queryset(self):
        queryset = Jersey.objects.select_related(
            'player', 
            'player__team'
        ).prefetch_related(
            'reviews',
            'wishlist_items'
        ).annotate(
            review_count=Count('reviews'),
            avg_rating=Avg('reviews__rating')
        )
        search = self.request.query_params.get('search', '')
        
        if search.lower() == 'sale':
            # Get jerseys that have active sales
            now = timezone.now()
            active_sales = Sale.objects.filter(
                is_active=True,
                start_date__lte=now,
                end_date__gte=now
            )
            sale_jerseys = []
            for jersey in queryset:
                if jersey.sale_price is not None:
                    sale_jerseys.append(jersey.id)
            return queryset.filter(id__in=sale_jerseys)
            
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Jersey not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CustomizationViewSet(viewsets.ModelViewSet):
    serializer_class = CustomizationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Log incoming request data
        print("Received customization request:")
        print(f"Headers: {request.headers}")
        print(f"Data: {request.data}")
        print(f"User: {request.user.username}")

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=400)

        try:
            self.perform_create(serializer)
            print(f"Successfully created customization: {serializer.data}")
            return Response(serializer.data, status=201)
        except Exception as e:
            print(f"Error creating customization: {str(e)}")
            return Response({"error": str(e)}, status=400)

    def get_queryset(self):
        return Customization.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CheckoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            cart_items = request.data.get('items', [])
            total_price = request.data.get('total_price', 0.0)
            payment_data = request.data.get('payment', {})

            if not cart_items:
                return Response(
                    {"error": "Cart items are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Format cart items based on type
            formatted_items = []
            for item in cart_items:
                if item['type'] == 'custom':
                    formatted_item = {
                        'type': 'custom',
                        'jersey_id': item['jersey_id'],
                        'quantity': item['quantity'],
                        'price': item['price'],
                        'customization': item['customization']
                    }
                else:
                    formatted_item = {
                        'type': 'regular',
                        'jersey_id': item['jersey_id'],
                        'quantity': item['quantity'],
                        'price': item['price'],
                        'player_name': item['player']['name'] if item.get('player') else 'Unknown'
                    }
                formatted_items.append(formatted_item)

            # Create an order with cart items
            order = Order.objects.create(
                user=user,
                total_price=total_price,
                items=formatted_items,
                status='processing'
            )

            # Create a payment linked to the order
            Payment.objects.create(
                order=order,
                name_on_card=payment_data.get('name_on_card'),
                card_number=payment_data.get('card_number'),
                expiration_date=payment_data.get('expiration_date'),
            )

            # Clear the cart after successful order
            cache.delete(f'cart_{user.id}')

            return Response({
                "message": "Order placed successfully!",
                "order_id": order.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Checkout Error: {str(e)}")
            print(f"Request data: {request.data}")  # Add more detailed logging
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
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
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            logger.info(f"Admin dashboard request from user: {request.user.username}")
            
            # Get basic metrics
            total_orders = Order.objects.count()
            logger.info(f"Total orders: {total_orders}")
            
            total_revenue = Order.objects.aggregate(
                total=models.Sum('total_price')
            )['total'] or 0
            logger.info(f"Total revenue: {total_revenue}")
            
            avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
            total_customers = User.objects.filter(is_staff=False).count()

            # Get orders by status
            orders_by_status = Order.objects.values('status').annotate(
                count=models.Count('id')
            )

            # Get low stock jerseys
            low_stock_jerseys = Jersey.objects.filter(
                stock__lte=F('low_stock_threshold')
            ).select_related('player').values(
                'id', 
                'stock', 
                'low_stock_threshold',
                'player__name'
            )
            logger.info(f"Found {low_stock_jerseys.count()} low stock jerseys")

            # Get recent orders
            recent_orders = Order.objects.select_related('user').order_by('-created_at')[:10]
            
            response_data = {
                'kpis': {
                    'total_orders': total_orders,
                    'total_revenue': float(total_revenue),
                    'average_order_value': float(avg_order_value),
                    'total_customers': total_customers,
                    'orders_by_status': {
                        status['status']: status['count'] 
                        for status in orders_by_status
                    }
                },
                'recent_orders': [
                    {
                        'id': order.id,
                        'user': order.user.username,
                        'total_price': float(order.total_price),
                        'status': order.status,
                        'created_at': order.created_at
                    }
                    for order in recent_orders
                ],
                'low_stock_jerseys': list(low_stock_jerseys)
            }
            
            logger.info("Sending admin dashboard response")
            logger.debug(f"Response data: {response_data}")
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error in AdminDashboardView: {str(e)}")
            logger.exception(e)
            return Response(
                {'error': 'Failed to fetch dashboard data'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
        try:
            jersey_id = request.data.get('jersey')
            print(f"Received wishlist request with data: {request.data}")  # Debug log
            
            if not jersey_id:
                return Response(
                    {'error': 'Jersey ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify jersey exists
            try:
                jersey = Jersey.objects.get(id=jersey_id)
            except Jersey.DoesNotExist:
                return Response(
                    {'error': f'Jersey with id {jersey_id} does not exist'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if already in wishlist
            wishlist_item, created = Wishlist.objects.get_or_create(
                user=request.user,
                jersey=jersey
            )
            
            return Response(
                {
                    'message': 'Added to wishlist successfully',
                    'created': created
                },
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        except Exception as e:
            print(f"Wishlist error: {str(e)}")  # Debug log
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, jersey_id):
        try:
            wishlist_item = Wishlist.objects.filter(
                user=request.user,
                jersey_id=jersey_id
            ).first()
            
            if not wishlist_item:
                return Response(
                    {'error': 'Item not found in wishlist'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            wishlist_item.delete()
            return Response(
                {'message': 'Removed from wishlist successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class FilterMetadataView(APIView):
    permission_classes = [AllowAny]  # Allow public access
    
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
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    try:
        if request.user.is_staff:
            return Response({
                'redirect': 'admin',
                'message': 'Please use the admin dashboard endpoint'
            }, status=status.HTTP_303_SEE_OTHER)
        
        # Regular user dashboard
        # Get recent orders
        recent_orders = Order.objects.filter(user=request.user).order_by('-created_at')[:5]
        
        # Get wishlist items
        wishlist_items = Wishlist.objects.filter(user=request.user).select_related(
            'jersey', 
            'jersey__player', 
            'jersey__player__team'
        )
        
        # Get recommended jerseys
        recommended_jerseys = Jersey.objects.select_related(
            'player', 
            'player__team'
        ).all()[:5]

        response_data = {
            "recent_orders": OrderSerializer(recent_orders, many=True).data,
            "wishlist": JerseySerializer(
                [item.jersey for item in wishlist_items], 
                many=True, 
                context={'request': request}
            ).data,
            "recommendations": JerseySerializer(
                recommended_jerseys, 
                many=True, 
                context={'request': request}
            ).data,
        }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Dashboard Error: {str(e)}")
        return Response(
            {'error': 'Failed to load dashboard data'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        jersey_id = self.kwargs.get('jersey_id')
        queryset = Review.objects.filter(jersey_id=jersey_id).order_by('-created_at')
        
        # Add a flag to identify the user's own review
        if self.request.user.is_authenticated:
            for review in queryset:
                review.is_users_review = (review.user == self.request.user)
        
        return queryset

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        
        # Check if the user owns this review
        if review.user != request.user:
            return Response(
                {"error": "You can only edit your own reviews"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(review, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update jersey's average rating
        jersey = review.jersey
        avg_rating = Review.objects.filter(jersey=jersey).aggregate(models.Avg('rating'))['rating__avg']
        jersey.average_rating = avg_rating
        jersey.save()

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        jersey_id = self.kwargs.get('jersey_id')
        try:
            jersey = Jersey.objects.get(id=jersey_id)
        except Jersey.DoesNotExist:
            return Response(
                {"error": "Jersey not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user has purchased the jersey
        orders = Order.objects.filter(
            user=request.user,
            status__in=['processing', 'delivered']  # Include both processing and delivered orders
        )

        has_purchased = False
        for order in orders:
            try:
                items = order.items if isinstance(order.items, list) else []
                for item in items:
                    if isinstance(item, dict) and str(item.get('jersey_id', '')) == str(jersey_id):
                        has_purchased = True
                        break
                if has_purchased:
                    break
            except Exception as e:
                print(f"Error checking order items: {e}")
                continue

        if not has_purchased:
            return Response(
                {"error": "You can only review jerseys you have purchased"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user already reviewed this jersey
        existing_review = Review.objects.filter(user=request.user, jersey=jersey).first()
        if existing_review:
            return Response(
                {"error": "You have already reviewed this jersey"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create the review
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user, jersey=jersey)
            
            # Update jersey's average rating
            jersey_reviews = Review.objects.filter(jersey=jersey)
            avg_rating = jersey_reviews.aggregate(models.Avg('rating'))['rating__avg']
            jersey.average_rating = avg_rating
            jersey.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error creating review: {e}")
            return Response(
                {"error": "Failed to create review"},
                status=status.HTTP_400_BAD_REQUEST
            )

class OrderStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
            
            # Check if the user owns this order or is an admin
            if not (request.user.is_staff or order.user == request.user):
                return Response(
                    {'error': 'Not authorized to modify this order'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Don't allow updating delivered orders
            if order.status == 'delivered':
                return Response(
                    {'error': 'Cannot modify delivered orders'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Regular users can only cancel orders
            if not request.user.is_staff and new_status != 'cancelled':
                return Response(
                    {'error': 'Users can only cancel orders'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Validate status
            if new_status not in dict(Order.STATUS_CHOICES):
                return Response(
                    {'error': 'Invalid status'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order.status = new_status
            order.save()
            
            return Response(OrderSerializer(order).data)
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def filter_metadata(request):
    leagues = Team.objects.values_list('league', flat=True).distinct()
    teams = Team.objects.values_list('name', flat=True).distinct()
    
    return Response({
        'leagues': list(leagues),
        'teams': list(teams)
    })

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        orders = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        # Redirect list to my_orders for regular users
        return self.my_orders(request)

class JerseyStockView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            logger.info(f"User {request.user.username} requesting low stock jerseys")
            
            # Get low stock jerseys
            low_stock_jerseys = Jersey.objects.filter(
                stock__lte=F('low_stock_threshold')
            ).select_related('player')  # Add select_related for better performance
            
            logger.info(f"Found {low_stock_jerseys.count()} low stock jerseys")
            
            # Log each jersey's details
            for jersey in low_stock_jerseys:
                logger.info(
                    f"Low stock jersey - ID: {jersey.id}, "
                    f"Player: {jersey.player.name}, "
                    f"Stock: {jersey.stock}, "
                    f"Threshold: {jersey.low_stock_threshold}"
                )
            
            serializer = JerseySerializer(low_stock_jerseys, many=True)
            data = {
                'low_stock_jerseys': serializer.data,
                'count': low_stock_jerseys.count()
            }
            
            logger.info(f"Returning data with {len(serializer.data)} jerseys")
            return Response(data)
            
        except Exception as e:
            logger.error(f"Error in JerseyStockView: {str(e)}")
            logger.exception(e)
            return Response(
                {'error': 'Failed to fetch low stock jerseys'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, jersey_id):
        try:
            jersey = Jersey.objects.get(id=jersey_id)
            serializer = AdminJerseySerializer(jersey, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Stock updated successfully',
                    'data': serializer.data
                })
            return Response(serializer.errors, status=400)
        except Jersey.DoesNotExist:
            return Response({'error': 'Jersey not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_check(request):
    return Response({
        'is_admin': request.user.is_staff,
        'username': request.user.username
    })

class SaleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)