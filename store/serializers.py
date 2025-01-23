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
    class Meta:
        model = Jersey
        fields = '__all__'

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = '__all__'
