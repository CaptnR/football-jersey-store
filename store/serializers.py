from rest_framework import serializers
from .models import Team, Player, Jersey, Customization, Order, Review, Sale, OrderItem
from django.db import models
from .constants import CURRENCY

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
    currency = serializers.SerializerMethodField()
    team_name = serializers.CharField(source='player.team.name', read_only=True)
    league = serializers.CharField(source='player.team.league', read_only=True)
    average_rating = serializers.SerializerMethodField()
    user_has_purchased = serializers.SerializerMethodField()
    is_low_stock = serializers.BooleanField(read_only=True)
    sale_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, required=False)
    on_sale = serializers.SerializerMethodField()
    
    class Meta:
        model = Jersey
        fields = [
            'id', 'player', 'price', 'currency', 'image', 'team_name', 
            'league', 'average_rating', 'user_has_purchased', 'stock',
            'low_stock_threshold', 'is_low_stock', 'sale_price', 'on_sale'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['price'] = float(instance.price)
        if instance.sale_price is not None:
            representation['sale_price'] = float(instance.sale_price)
        return representation

    def get_currency(self, obj):
        return CURRENCY

    def get_average_rating(self, obj):
        try:
            return Review.objects.filter(jersey=obj).aggregate(
                avg_rating=models.Avg('rating')
            )['avg_rating'] or 0
        except Exception as e:
            print(f"Error calculating average rating: {e}")
            return 0

    def get_user_has_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return Order.objects.filter(
                    user=request.user,
                    status='delivered',
                    items__contains=[{'jersey_id': obj.id}]  # Check in the JSON field
                ).exists()
            except Exception as e:
                print(f"Error checking purchase status: {e}")
                return False
        return False

    def get_on_sale(self, obj):
        return obj.sale_price is not None

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = [
            'id', 'jersey_type', 'jersey', 'name', 'number',
            'primary_color', 'secondary_color', 'size', 'quantity'
        ]
        read_only_fields = ['user']

    def validate(self, data):
        if data.get('jersey_type') == 'existing' and not data.get('jersey'):
            raise serializers.ValidationError("Jersey ID is required for existing jersey customization")
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['jersey', 'quantity', 'price', 'size', 'type', 'player_name']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
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

class AdminJerseySerializer(serializers.ModelSerializer):
    class Meta:
        model = Jersey
        fields = ['id', 'stock', 'low_stock_threshold']

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'
