from rest_framework import serializers
from .models import Team, Player, Jersey, Customization, Order, Review, Sale, OrderItem, JerseyImage, Return
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

class JerseyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = JerseyImage
        fields = ['id', 'image', 'is_primary', 'order']

class JerseySerializer(serializers.ModelSerializer):
    player = PlayerSerializer()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.SerializerMethodField()
    team_name = serializers.CharField(source='player.team.name', read_only=True)
    league = serializers.CharField(source='player.team.league', read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    user_has_purchased = serializers.SerializerMethodField()
    is_low_stock = serializers.BooleanField(read_only=True)
    images = JerseyImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    sale_price = serializers.SerializerMethodField()
    on_sale = serializers.SerializerMethodField()

    class Meta:
        model = Jersey
        fields = [
            'id', 'player', 'number', 'price', 'currency', 'description',
            'stock', 'low_stock_threshold', 'images', 'primary_image',
            'team_name', 'league', 'average_rating', 'total_reviews',
            'user_has_purchased', 'is_low_stock', 'sale_price', 'on_sale'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['price'] = float(instance.price)
        if instance.sale_price is not None:
            representation['sale_price'] = float(instance.sale_price)
        if representation.get('average_rating'):
            representation['average_rating'] = float(instance.average_rating)
        return representation

    def get_currency(self, obj):
        return CURRENCY

    def get_user_has_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return OrderItem.objects.filter(
                    order__user=request.user,
                    order__status='delivered',
                    jersey=obj
                ).exists()
            except Exception as e:
                print(f"Error checking purchase status: {e}")
                return False
        return False

    def get_primary_image(self, obj):
        primary_image = obj.images.first()
        if primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None

    def get_sale_price(self, obj):
        return obj.sale_price

    def get_on_sale(self, obj):
        return obj.sale_price is not None

class CustomizationSerializer(serializers.ModelSerializer):
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
        ('XXXL', 'Triple Extra Large')
    ]
    
    size = serializers.ChoiceField(choices=SIZE_CHOICES, default='M')

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
    jersey_id = serializers.IntegerField(source='jersey.id', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['jersey_id', 'quantity', 'price', 'size', 'type', 'player_name']

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
    items = OrderItemSerializer(many=True, read_only=True)
    status = serializers.CharField()
    
    class Meta:
        model = Order
        fields = ['id', 'total_price', 'status', 'created_at', 'items']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Ensure status is lowercase for consistent comparison
        representation['status'] = representation['status'].lower()
        return representation

class AdminOrderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username')
    return_id = serializers.SerializerMethodField()
    return_reason = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_price', 'created_at', 'return_id', 'return_reason']

    def get_return_id(self, obj):
        return_request = Return.objects.filter(order=obj).first()
        return return_request.id if return_request else None

    def get_return_reason(self, obj):
        return_request = Return.objects.filter(order=obj).first()
        return return_request.reason if return_request else None

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    is_edited = serializers.BooleanField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'user_name', 'created_at', 'is_edited']
        read_only_fields = ['user', 'created_at']

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

class ReturnSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = Return
        fields = ['id', 'order', 'user', 'reason', 'status', 'created_at', 'order_details']
        read_only_fields = ['user', 'status']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
