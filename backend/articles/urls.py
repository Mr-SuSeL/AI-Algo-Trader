# backend/articles/urls.py
from django.urls import path
from .views import article_list, article_detail_by_slug, article_create, article_delete_by_slug, article_update_by_slug

urlpatterns = [
    path('', article_list, name='article-list'), # Dla GET na /api/articles/
    path('add/', article_create, name='article-create'), # Dla POST na /api/articles/add/
    path('<slug:slug>/', article_detail_by_slug, name='article-detail-by-slug'),
    path('delete/<slug:slug>/', article_delete_by_slug, name='article-delete-by-slug'), # Dla DELETE
    path('update/<slug:slug>/', article_update_by_slug, name='article-update-by-slug'), # Dla PUT
]