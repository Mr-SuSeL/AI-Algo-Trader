# api/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include("users.urls")),
    path('api/articles/', include("articles.urls")),
    path('ckeditor5/', include('django_ckeditor_5.urls')),  # <–– uwaga na 'ckeditor5/' i na nazwę aplikacji
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
