# backend/articles/serializers.py

import re # Importuj moduł re do wyrażeń regularnych
from rest_framework import serializers
from .models import Article
from users.serializers import CustomUserSerializer
from django.conf import settings # Importuj settings, aby użyć DEBUG i skonstruować URL

class ArticleListSerializer(serializers.ModelSerializer):
    author = CustomUserSerializer(read_only=True)  # Zagnieżdżony serializer dla autora

    class Meta:
        model = Article
        fields = (
            'id',
            'title',
            'description',
            'slug',
            'author',
            'published',
        )

class ArticleDetailSerializer(serializers.ModelSerializer):
    author = CustomUserSerializer(read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)

    # *** KLUCZOWA ZMIANA: Jawne zdefiniowanie pola 'content' ***
    # Domyślnie Django REST Framework nie ucieka HTML w CharField.
    # Upewniamy się, że to pole jest traktowane jako zwykły string
    # bez dodatkowego uciekania. Jeśli ma być tylko do odczytu przez API,
    # możesz dodać read_only=True.
    content = serializers.CharField(allow_null=True, allow_blank=True)


    class Meta:
        model = Article
        fields = (
            'id',
            'title',
            'description',
            'content', # Pole 'content' nadal musi być wymienione w 'fields'
            'slug',
            'author',
            'author_username',
            'published',
            'updated_article',
        )

    # Dodajemy metodę to_representation, aby przetworzyć treść artykułu
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        content = representation.get('content') # Pobierz treść artykułu

        if content:
            # Upewnij się, że ten URL odpowiada adresowi, pod którym działa Twoje Django
            # W trybie deweloperskim to zazwyczaj http://localhost:8000/
            # W środowisku produkcyjnym będziesz musiał to zmienić na adres domeny Twojego API
            # Możesz użyć zmiennej środowiskowej lub stałego adresu dla produkcji.
            # Dla developementu użyjemy prostego localhost:8000
            django_base_url = "http://localhost:8000"

            # Wyrażenie regularne szuka 'src="' po którym następuje /media/ i cokolwiek innego (bez cudzysłowu).
            # (?!https?://) to "negative lookahead" - upewnia się, że src nie zaczyna się już od http:// lub https://,
            # zapobiegając podwójnemu dodawaniu prefixu do już absolutnych URL-i.
            pattern = r'src="(?!https?://)(/media/[^"]*)"'
            replacement = r'src="' + django_base_url + r'\1"'
            representation['content'] = re.sub(pattern, replacement, content)

        return representation


class ArticleCreateSerializer(serializers.ModelSerializer):
    """
    Serializator używany przy tworzeniu nowego artykułu.
    Autor (pole `author`) będzie ustawiany po stronie widoku
    przez np. request.user, więc nie ma go tutaj w polach.
    """
    class Meta:
        model = Article
        fields = ('title', 'description', 'content')

class ArticleUpdateSerializer(serializers.ModelSerializer):
    """
    Serializator używany przy aktualizacji artykułu.
    Bez zmiany autora – zakładamy, że autor zostaje ten sam.
    """
    class Meta:
        model = Article
        fields = ('title', 'description', 'content')