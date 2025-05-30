# backend/articles/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Article
from .serializers import ArticleListSerializer, ArticleDetailSerializer, ArticleCreateSerializer
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def article_list(request):
    articles = Article.objects.all().order_by('-published')
    serializer = ArticleListSerializer(articles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def article_detail_by_slug(request, slug):
    article = get_object_or_404(Article, slug=slug)
    serializer = ArticleDetailSerializer(article) # Używamy ArticleDetailSerializer
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def article_create(request):
    print("Otrzymane dane:", request.data) # Dodaj to logowanie
    serializer = ArticleCreateSerializer(data=request.data)
    if serializer.is_valid():
        article = serializer.save(author=request.user)
        return Response(ArticleDetailSerializer(article).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE']) # Określamy, że to jest widok dla metody DELETE
@permission_classes([IsAuthenticated]) # Wymagaj uwierzytelnienia do usuwania
def article_delete_by_slug(request, slug): # Teraz przyjmuje 'slug'
    article = get_object_or_404(Article, slug=slug)

    if article.author == request.user or request.user.is_staff or request.user.is_superuser:
        article.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response({"detail": "Nie masz uprawnień do usunięcia tego artykułu."}, status=status.HTTP_403_FORBIDDEN)