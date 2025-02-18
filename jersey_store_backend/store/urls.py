from django.urls import path
from .views import CustomizationView

urlpatterns = [
    # ... other URL patterns ...
    path('customizations/', CustomizationView.as_view(), name='customizations'),
] 