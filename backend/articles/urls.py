from django.urls import path
from .views import article_list, article_detail_by_slug, article_create

urlpatterns = [
    path('', article_list, name='article-list'), # Dla GET na /api/articles/
    path('add/', article_create, name='article-create'), # Dla POST na /api/articles/add/
    path('<slug:slug>/', article_detail_by_slug, name='article-detail-by-slug'),
]