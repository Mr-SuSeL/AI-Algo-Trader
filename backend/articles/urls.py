from django.urls import path
from .views import article_list, article_detail_by_slug

urlpatterns = [
    path('articles/', article_list, name='article-list'),
    path('articles/<slug:slug>/', article_detail_by_slug, name='article-detail-by-slug'),
]