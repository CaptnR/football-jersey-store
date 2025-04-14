from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from .models import Team, Player, Jersey, Customization, Order, Wishlist, Review, Sale, OrderItem, Return
from .serializers import TeamSerializer, PlayerSerializer, JerseySerializer, CustomizationSerializer, UserOrderSerializer, AdminOrderSerializer, OrderSerializer, ReviewSerializer, AdminJerseySerializer, SaleSerializer, ReturnSerializer
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
from django.db.models import Count, Avg, F, Q
import logging
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from django.urls import reverse
from django.shortcuts import get_object_or_404

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
                'error': 'Invalid credentials'
            }, status=400)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid credentials'
            }, status=400)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=400)

class TeamViewSet(ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class PlayerViewSet(ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class JerseyViewSet(viewsets.ModelViewSet):
    serializer_class = JerseySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['player__name', 'player__team__name', 'player__team__league']

    def get_queryset(self):
        queryset = Jersey.objects.all().prefetch_related(
            'images',
            'reviews',
            'player__team'
        ).annotate(
            avg_rating=models.Avg('reviews__rating')
        )

        # Handle filters
        league = self.request.query_params.get('league', None)
        team = self.request.query_params.get('team', None)
        min_rating = self.request.query_params.get('min_rating', None)

        if league:
            queryset = queryset.filter(player__team__league=league)
        
        if team:
            queryset = queryset.filter(player__team__name=team)

        if min_rating is not None and min_rating != '0':
            queryset = queryset.filter(average_rating__gte=float(min_rating))

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

    def destroy(self, request, *args, **kwargs):
        jersey = self.get_object()
        try:
            with transaction.atomic():
                # Delete all orders that contain only this jersey
                orders_to_delete = Order.objects.filter(
                    id__in=OrderItem.objects.filter(jersey=jersey)
                    .values('order')
                    .annotate(count=Count('order'))
                    .filter(count=1)
                    .values_list('order', flat=True)
                )
                orders_to_delete.delete()

                # For orders with multiple items, just delete the item containing this jersey
                OrderItem.objects.filter(jersey=jersey).delete()
                
                # Delete related wishlist items
                Wishlist.objects.filter(jersey=jersey).delete()
                
                # Delete related reviews
                Review.objects.filter(jersey=jersey).delete()
                
                # Delete the jersey itself
                jersey.delete()
                
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': f'Failed to delete jersey: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        jersey_ids = request.data.get('jersey_ids', [])
        if not jersey_ids:
            return Response(
                {'error': 'No jerseys specified for deletion'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Delete orders that only contain these jerseys
                orders_to_delete = Order.objects.filter(
                    id__in=OrderItem.objects.filter(jersey_id__in=jersey_ids)
                    .values('order')
                    .annotate(count=Count('order'))
                    .filter(count=1)
                    .values_list('order', flat=True)
                )
                orders_to_delete.delete()

                # For orders with multiple items, just delete the items containing these jerseys
                OrderItem.objects.filter(jersey_id__in=jersey_ids).delete()
                
                # Delete related wishlist items
                Wishlist.objects.filter(jersey_id__in=jersey_ids).delete()
                
                # Delete related reviews
                Review.objects.filter(jersey_id__in=jersey_ids).delete()
                
                # Delete the jerseys
                Jersey.objects.filter(id__in=jersey_ids).delete()
                
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': f'Failed to delete jerseys: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            with transaction.atomic():
                # Create the order
                order = Order.objects.create(
                    user=request.user,
                    total_price=request.data.get('total_price', 0),
                    status='pending'
                )

                # Process each item in the cart
                items = request.data.get('items', [])
                for item in items:
                    if item.get('type') == 'custom':
                        # Handle custom jersey
                        OrderItem.objects.create(
                            order=order,
                            quantity=item.get('quantity', 1),
                            price=item.get('price', 0),
                            size=item.get('size', 'M'),
                            type='custom',
                            player_name=item.get('name', '')  # Store custom name
                        )
                    else:
                        # Handle regular jersey
                        try:
                            jersey = Jersey.objects.get(id=item.get('jersey_id'))
                            OrderItem.objects.create(
                                order=order,
                                jersey=jersey,
                                quantity=item.get('quantity', 1),
                                price=item.get('price', 0),
                                size=item.get('size', 'M'),
                                type='regular'
                            )
                        except Jersey.DoesNotExist:
                            raise serializers.ValidationError(f"Jersey with id {item.get('jersey_id')} not found")

                return Response({
                    'message': 'Order created successfully',
                    'order_id': order.id
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
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
        orders = Order.objects.all().order_by('-created_at')
        # Prefetch related return requests to optimize queries
        orders = orders.prefetch_related('returns')
        serializer = AdminOrderSerializer(orders, many=True)
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
            purchased_jerseys = OrderItem.objects.filter(
                order__user=request.user,
                order__status='delivered'
            ).values_list('jersey_id', flat=True)

            recommendations = Jersey.objects.exclude(
                id__in=purchased_jerseys
            ).select_related(
                'player', 
                'player__team'
            ).prefetch_related(
                'images'
            )[:5]

            serializer = JerseySerializer(
                recommendations, 
                many=True,
                context={'request': request}
            )
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        

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
        return Review.objects.filter(jersey_id=self.kwargs['jersey_id'])

    def perform_create(self, serializer):
        jersey = get_object_or_404(Jersey, id=self.kwargs['jersey_id'])
        # Check if user has already reviewed this jersey
        if Review.objects.filter(user=self.request.user, jersey=jersey).exists():
            raise serializers.ValidationError("You have already reviewed this jersey")
        serializer.save(user=self.request.user, jersey=jersey)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            # Fetch updated jersey data
            jersey = Jersey.objects.get(id=self.kwargs['jersey_id'])
            return Response({
                'message': 'Review created successfully',
                'average_rating': jersey.average_rating,
                'total_reviews': jersey.total_reviews,
                'data': response.data
            })
        except serializers.ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OrderStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
            
            # Check if user owns this order or is admin
            if not (request.user.is_staff or order.user == request.user):
                return Response(
                    {'error': 'Not authorized to modify this order'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            new_status = request.data.get('status')
            
            if not new_status:
                return Response(
                    {'error': 'Status is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Don't allow modifying delivered orders
            if order.status == 'delivered':
                return Response(
                    {'error': 'Cannot modify delivered orders'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Regular users can only cancel pending or processing orders
            if not request.user.is_staff:
                if new_status != 'cancelled':
                    return Response(
                        {'error': 'Users can only cancel orders'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                if order.status not in ['pending', 'processing']:
                    return Response(
                        {'error': 'Can only cancel pending or processing orders'}, 
                        status=status.HTTP_400_BAD_REQUEST
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
@permission_classes([AllowAny])
def filter_metadata(request):
    """Return metadata for filters like leagues and teams"""
    try:
        # Get unique leagues and teams
        leagues = Jersey.objects.values_list(
            'player__team__league', flat=True
        ).distinct().order_by('player__team__league')
        
        teams = Jersey.objects.values_list(
            'player__team__name', flat=True
        ).distinct().order_by('player__team__name')
        
        return Response({
            'leagues': list(leagues),
            'teams': list(teams)
        })
    except Exception as e:
        logger.error(f"Error fetching filter metadata: {str(e)}")
        return Response(
            {'error': 'Failed to fetch filter metadata'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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

class OrderReturnView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            
            if order.status != 'delivered':
                return Response(
                    {"error": "Only delivered orders can be returned"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update order status to return_requested
            order.status = 'return_requested'
            order.save()

            # Create return request
            return_reason = request.data.get('reason', '')
            Return.objects.create(
                order=order,
                user=request.user,
                reason=return_reason
            )

            return Response({"message": "Return request submitted successfully"})
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class ReturnApprovalView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, return_id):
        try:
            return_request = Return.objects.get(id=return_id)
            
            # Determine action from URL
            if 'approve' in request.path:
                action = 'approve'
            elif 'reject' in request.path:
                action = 'reject'
            else:
                return Response(
                    {"error": "Invalid action URL"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if action == 'approve':
                return_request.status = 'approved'
                return_request.order.status = 'return_approved'
            else:  # reject
                return_request.status = 'rejected'
                return_request.order.status = 'return_rejected'

            return_request.save()
            return_request.order.save()

            return Response({
                "message": f"Return request {action}d successfully",
                "status": return_request.status
            })
        except Return.DoesNotExist:
            return Response(
                {"error": "Return request not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class PendingReturnsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        returns = Return.objects.filter(status='pending').select_related('order', 'user')
        serializer = ReturnSerializer(returns, many=True)
        return Response(serializer.data)