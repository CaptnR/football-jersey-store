from rest_framework import serializers
from .models import Customization, OrderItem, Order

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = ['id', 'jersey', 'design', 'primary_color', 'secondary_color', 
                 'name', 'number', 'size', 'quantity', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        # Add custom validation
        required_fields = ['jersey', 'design', 'name', 'number']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            raise serializers.ValidationError({
                'missing_fields': f"Required fields missing: {', '.join(missing_fields)}"
            })

        # Validate number length
        if len(data.get('number', '')) > 2:
            raise serializers.ValidationError({
                'number': "Number must be maximum 2 characters"
            })

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return Customization.objects.create(user=user, **validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['type', 'jersey_id', 'quantity', 'price', 'player_name', 'size']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_price', 'created_at', 'updated_at', 'items'] 