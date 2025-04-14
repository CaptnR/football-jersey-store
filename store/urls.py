from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, PlayerViewSet, JerseyViewSet, CustomizationViewSet, login_user, signup_user, dashboard_view, filter_metadata, SaleViewSet
from .views import CheckoutView, UserOrderView, AdminOrderView, AdminDashboardView, RecommendedJerseysView, WishlistView, FilterMetadataView, OrderViewSet, JerseyStockView
from . import views

router = DefaultRouter()
router.register('jerseys', JerseyViewSet, basename='jersey')
router.register('orders', OrderViewSet, basename='order')
router.register('teams', TeamViewSet, basename='team')
router.register('players', PlayerViewSet, basename='player')
router.register('customizations', CustomizationViewSet, basename='customization')
router.register(r'admin/sales', SaleViewSet, basename='admin-sales')

urlpatterns = [
    path('jerseys/recommendations/', RecommendedJerseysView.as_view(), name='recommended-jerseys'),
    path('metadata/', FilterMetadataView.as_view(), name='filter-metadata'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('', include(router.urls)),
]

urlpatterns += [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
]

urlpatterns += [
    # Admin routes - make sure these are at the top
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/orders/', views.AdminOrderView.as_view(), name='admin-orders'),
    path('admin/orders/<int:pk>/', views.AdminOrderView.as_view(), name='admin-order-detail'),
    path('admin/check/', views.admin_check, name='admin-check'),
    
    # Stock management routes
    path('jerseys/<int:jersey_id>/stock/', views.JerseyStockView.as_view(), name='jersey-stock-update'),
    path('jerseys/stock/', views.JerseyStockView.as_view(), name='jersey-stock'),
]

urlpatterns += [
    path('wishlist/', WishlistView.as_view(), name='wishlist-add'),
    path('wishlist/<int:jersey_id>/', WishlistView.as_view(), name='wishlist-remove'),
]

urlpatterns += [
    path('login/', login_user, name='login'),
]

urlpatterns += [
    path('signup/', signup_user, name='signup'),
]

urlpatterns += [
    path('jerseys/<int:jersey_id>/reviews/', views.ReviewViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='jersey-reviews'),
    path('jerseys/<int:jersey_id>/reviews/<int:pk>/', views.ReviewViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='review-detail'),
]

urlpatterns += [
    path('filter-metadata/', filter_metadata, name='filter-metadata'),
]

urlpatterns += [
    path('orders/<int:order_id>/status/', views.OrderStatusView.as_view(), name='order-status-update'),
]

urlpatterns += [
    path('orders/<int:order_id>/return/', views.OrderReturnView.as_view(), name='order-return'),
]

urlpatterns += [
    path('returns/<int:return_id>/approve/', views.ReturnApprovalView.as_view(), name='return-approval'),
]

urlpatterns += [
    path('returns/pending/', views.PendingReturnsView.as_view(), name='pending-returns'),
]