from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from .models import Team, Player, Jersey, Customization, Order, Payment, Wishlist, Review
from .serializers import TeamSerializer, PlayerSerializer, JerseySerializer, CustomizationSerializer, UserOrderSerializer, AdminOrderSerializer, OrderSerializer, ReviewSerializer
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
from django.db.models import Count, Avg

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
    username = request.data.get('username')
    password = request.data.get('password')
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'is_admin': user.is_staff,  # Make sure this is being sent
                'username': user.username
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

class JerseyViewSet(viewsets.ModelViewSet):
    queryset = Jersey.objects.all()
    serializer_class = JerseySerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['player__name', 'player__team__name', 'player__team__league']
    filterset_fields = ['player__team__league', 'player__team__name']

    def get_queryset(self):
        return Jersey.objects.select_related(
            'player', 
            'player__team'
        ).prefetch_related(
            'reviews',
            'wishlist_items'
        ).annotate(
            review_count=Count('reviews'),
            avg_rating=Avg('reviews__rating')
        )
    
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
            cart_items = request.data.get('items', [])  # Changed to match frontend data structure
            total_price = request.data.get('total_price', 0.0)
            payment_data = request.data.get('payment', {})

            # Validate required data
            if not cart_items:
                return Response(
                    {"error": "Cart items are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Format cart items to include necessary information
            formatted_items = [{
                'jersey_id': item['id'],
                'quantity': item['quantity'],
                'price': item['price'],
                'player_name': item['player']['name']
            } for item in cart_items]

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
            print(f"Checkout Error: {str(e)}")  # Add logging
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
        user = request.user

        if user.is_staff:
            try:
                # Calculate KPIs
                total_orders = Order.objects.count()
                total_revenue = Order.objects.aggregate(
                    total=models.Sum('total_price'))['total'] or 0

                # Calculate orders by status correctly
                orders_by_status = {}
                for status_code, status_name in Order.STATUS_CHOICES:
                    count = Order.objects.filter(status=status_code).count()
                    orders_by_status[status_name] = count

                recent_orders = Order.objects.all().order_by('-created_at')[:10]
                
                response_data = {
                    "kpis": {
                        "total_orders": total_orders,
                        "total_revenue": float(total_revenue),
                        "average_order_value": round(float(total_revenue) / total_orders if total_orders > 0 else 0, 2),
                        "total_customers": User.objects.filter(is_staff=False).count(),
                        "orders_by_status": orders_by_status,
                        "pending_orders": Order.objects.filter(status='pending').count(),
                        "processing_orders": Order.objects.filter(status='processing').count(),
                        "shipped_orders": Order.objects.filter(status='shipped').count(),
                        "delivered_orders": Order.objects.filter(status='delivered').count(),
                        "cancelled_orders": Order.objects.filter(status='cancelled').count()
                    },
                    "recent_orders": OrderSerializer(recent_orders, many=True).data,
                }
                return Response(response_data)
            except Exception as admin_error:
                print(f"Admin dashboard error: {str(admin_error)}")
                raise

        # Regular user dashboard
        try:
            recent_orders = Order.objects.filter(user=user).order_by('-created_at')[:5]
            print(f"Recent orders for user {user.username}: {recent_orders.count()}")

            wishlist_items = Wishlist.objects.filter(user=user).select_related('jersey', 'jersey__player', 'jersey__player__team')
            print(f"Wishlist items for user {user.username}: {wishlist_items.count()}")

            recommended_jerseys = Jersey.objects.select_related('player', 'player__team').all()[:5]
            print(f"Recommended jerseys count: {recommended_jerseys.count()}")

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
            print("User response data structure:", list(response_data.keys()))
            return Response(response_data)
        except Exception as user_error:
            print(f"User dashboard error: {str(user_error)}")
            raise  # Re-raise to be caught by outer try-except

    except Exception as e:
        print(f"Dashboard Error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)}, 
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