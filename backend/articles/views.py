from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Article
from .serializers import ArticleListSerializer, ArticleDetailSerializer # Importujemy nowy serializator

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