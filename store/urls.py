from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, PlayerViewSet, JerseyViewSet, CustomizationViewSet, login_user, signup_user

router = DefaultRouter()
router.register('teams', TeamViewSet)
router.register('players', PlayerViewSet)
router.register('jerseys', JerseyViewSet)
router.register('customizations', CustomizationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

urlpatterns += [
    path('login/', login_user),
]

urlpatterns += [
    path('signup/', signup_user),
]
