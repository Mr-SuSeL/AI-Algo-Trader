from django.urls import path
from .views import article_list

# URL patterns for the articles app
urlpatterns = [
    path('articles/', article_list, name='article-list'),
]