from rest_framework import serializers
from .models import Team, Player, Jersey, Customization, Order, Payment, Review

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'league', 'logo']

class PlayerSerializer(serializers.ModelSerializer):
    team = TeamSerializer()
    
    class Meta:
        model = Player
        fields = ['id', 'name', 'team']

class JerseySerializer(serializers.ModelSerializer):
    player = PlayerSerializer()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    team_name = serializers.CharField(source='player.team.name', read_only=True)
    league = serializers.CharField(source='player.team.league', read_only=True)
    
    class Meta:
        model = Jersey
        fields = ['id', 'player', 'price', 'image', 'team_name', 'league']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['price'] = float(instance.price)
        return representation

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = '__all__'
        
class OrderSerializer(serializers.ModelSerializer):
    items = serializers.JSONField(default=list)
    user = serializers.StringRelatedField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'updated_at', 'items']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Ensure status is lowercase
        if representation.get('status'):
            representation['status'] = representation['status'].lower()
        return representation

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
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at', 'jersey']
        read_only_fields = ['user_name', 'created_at', 'jersey']

    def get_user_name(self, obj):
        return obj.user.username

    def validate_rating(self, value):
        if not isinstance(value, int) or value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be an integer between 1 and 5")
        return value
