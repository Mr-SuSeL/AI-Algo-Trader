# backend/articles/serializers.py
from rest_framework import serializers
from .models import Article
from users.serializers import CustomUserSerializer

class ArticleListSerializer(serializers.ModelSerializer):
    author = CustomUserSerializer(read_only=True) # Użyj CustomUserSerializer dla autora

    class Meta:
        model = Article
        fields = ('id', 'title', 'description', 'slug', 'author', 'published')
        # Teraz 'author' będzie zawierał dane użytkownika, w tym 'nickname'

class ArticleDetailSerializer(serializers.ModelSerializer):
    author = CustomUserSerializer(read_only=True) # Także w detail
    class Meta:
        model = Article
        fields = '__all__' # Zawiera wszystkie pola modelu

class ArticleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ('title', 'description', 'content')