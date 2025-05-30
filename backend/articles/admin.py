# backend/articles/admin.py
from django.contrib import admin
from .models import Article
from .forms import ArticleRegistrationForm, ArticleUpdateForm

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'published', 'updated_article', 'author')
    date_hierarchy = 'published'
    search_fields = ('title', 'description', 'content')
    ordering = ('-published',)
    list_display_links = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('published', 'author')

    def get_form(self, request, obj=None, **kwargs):
        if obj: # Jeśli edytujesz istniejący obiekt
            kwargs['form'] = ArticleUpdateForm
        else: # Jeśli dodajesz nowy obiekt
            kwargs['form'] = ArticleRegistrationForm
        return super().get_form(request, obj, **kwargs)

    # Opcjonalnie, możesz dodać pola do edycji - jeśli nie zdefiniujesz fields, Django użyje wszystkich
    fields = ('title', 'slug', 'author', 'description', 'content', 'published')