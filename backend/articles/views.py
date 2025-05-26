from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Article
from .serializers import ArticleListSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def article_list(request):
    articles = Article.objects.all().order_by('-published')
    serializer = ArticleListSerializer(articles, many=True)
    return Response(serializer.data)