from rest_framework.serializers import ModelSerializer, Serializer
from .models import CustomUser
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomUserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username')

# Rejestrowanie
class RegisterUserSerializer(ModelSerializer): # bez tego jest 403 
    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password')
        extra_kwargs = { "password": {"write_only":True} }
    
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
# Logowanie
class LoginUserSerializer(Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    #Nadpisanie metody walidacji
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials!")


