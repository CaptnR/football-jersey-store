from rest_framework import serializers
from .models import Team, Player, Jersey, Customization, Order, Payment, Review

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class JerseySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Jersey
        fields = ['id', 'price', 'image', 'player']

    def get_image(self, obj):
        # Get the request object from the serializer context
        request = self.context.get('request')
        if request is None:
            # Fallback if request is not available (for testing or other use cases)
            return obj.get_image_url()
        return request.build_absolute_uri(obj.get_image_url())

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = '__all__'
        
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'created_at', 'status']

class UserOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'total_price', 'status', 'created_at']

class AdminOrderSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Show username instead of user ID

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'name_on_card', 'card_number', 'expiration_date']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user_name', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username
