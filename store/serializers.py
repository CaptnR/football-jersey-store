from rest_framework import serializers
from .models import Team, Player, Jersey, Customization

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class JerseySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()  # Custom method for the image field

    class Meta:
        model = Jersey
        fields = ['id', 'price', 'image', 'player']

    def get_image(self, obj):
        request = self.context.get('request')  # Access the request context
        return request.build_absolute_uri(obj.get_image_url())  # Use the get_image_url() method

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = '__all__'
