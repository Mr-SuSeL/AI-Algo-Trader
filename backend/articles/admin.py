from django.contrib import admin
from .models import Article

# Register your models here.
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'published', 'updated_article', 'author')
    date_hierarchy = 'published'
    search_fields = ('title', 'description', 'content')
    ordering = ('-published',)
    list_display_links = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('published', 'author')