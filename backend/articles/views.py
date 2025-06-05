# backend/articles/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework import status

from .models import Article
from .serializers import (
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateSerializer,
    ArticleUpdateSerializer,
)

@api_view(['GET'])
@permission_classes([AllowAny])
def article_list(request):
    """
    Zwraca listę wszystkich artykułów w kolejności od najnowszych do najstarszych.
    """
    articles = Article.objects.all().order_by('-published')
    serializer = ArticleListSerializer(articles, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def article_detail_by_slug(request, slug):
    """
    Zwraca szczegóły pojedynczego artykułu na podstawie podanego slug.
    """
    article = get_object_or_404(Article, slug=slug)
    serializer = ArticleDetailSerializer(article)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def article_create(request):
    """
    Tworzy nowy artykuł. Pole 'author' zostanie przypisane z request.user.
    Tylko zalogowani użytkownicy mogą utworzyć artykuł.
    """
    serializer = ArticleCreateSerializer(data=request.data)
    if serializer.is_valid():
        article = serializer.save(author=request.user)
        return Response(
            ArticleDetailSerializer(article).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def article_delete_by_slug(request, slug):
    """
    Usuwa artykuł o podanym slug. Tylko autor lub użytkownicy staff/superuser
    mają prawo do usunięcia.
    """
    article = get_object_or_404(Article, slug=slug)

    if article.author == request.user or request.user.is_staff or request.user.is_superuser:
        article.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        return Response(
            {"detail": "You do not have permission to delete this article."},
            status=status.HTTP_403_FORBIDDEN
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def article_update_by_slug(request, slug):
    """
    Aktualizuje artykuł o podanym slug. Tylko autor lub użytkownicy staff/superuser
    mogą edytować istniejący artykuł.
    """
    article = get_object_or_404(Article, slug=slug)

    if article.author == request.user or request.user.is_staff or request.user.is_superuser:
        serializer = ArticleUpdateSerializer(article, data=request.data)
        if serializer.is_valid():
            updated_article = serializer.save()
            return Response(
                ArticleDetailSerializer(updated_article).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(
            {"detail": "You do not have permission to edit this article."},
            status=status.HTTP_403_FORBIDDEN
        )
