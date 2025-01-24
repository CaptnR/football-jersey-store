from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, PlayerViewSet, JerseyViewSet, CustomizationViewSet, login_user, signup_user
from .views import CheckoutView, UserOrderView, AdminOrderView, AdminDashboardView, RecommendedJerseysView, WishlistView

router = DefaultRouter()
router.register('jerseys', JerseyViewSet, basename='jersey')

router = DefaultRouter()
router.register('teams', TeamViewSet)
router.register('players', PlayerViewSet)
router.register('jerseys', JerseyViewSet)
router.register('customizations', CustomizationViewSet)

urlpatterns = [
    path('jerseys/recommendations/', RecommendedJerseysView.as_view(), name='recommended-jerseys'),
    path('', include(router.urls)),
]

urlpatterns += [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
]

urlpatterns += [
    # User order tracking
    path('orders/', UserOrderView.as_view(), name='user-orders'),

    # Admin order management
    path('admin/orders/', AdminOrderView.as_view(), name='admin-orders'),
    path('admin/orders/<int:pk>/', AdminOrderView.as_view(), name='admin-order-detail'),
    # Admin dashboard
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
]

urlpatterns += [
    path('login/', login_user),
]

urlpatterns += [
    path('signup/', signup_user),
]