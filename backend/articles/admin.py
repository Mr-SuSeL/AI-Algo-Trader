# backend/articles/admin.py

from django.contrib import admin
from .models import Article
from .forms import ArticleRegistrationForm, ArticleUpdateForm

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    # Pola wyświetlane na liście wpisów
    list_display = ('title', 'published', 'updated_article', 'author')
    date_hierarchy = 'published'
    search_fields = ('title', 'description', 'content')
    ordering = ('-published',)
    list_display_links = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('published', 'author')

    # Pola tylko-do-odczytu (nieedytowalne) w formularzu admina
    readonly_fields = ('published', 'updated_article')

    # Wybór formularza w zależności od tego, czy tworzymy nowy wpis, czy edytujemy istniejący
    def get_form(self, request, obj=None, **kwargs):
        if obj:  # Jeśli edytujesz istniejący obiekt, użyj ArticleUpdateForm
            kwargs['form'] = ArticleUpdateForm
        else:    # Jeśli dodajesz nowy obiekt, użyj ArticleRegistrationForm
            kwargs['form'] = ArticleRegistrationForm
        return super().get_form(request, obj, **kwargs)

    # Kolejność i widoczność pól w formularzu (bez 'published', bo jest w readonly_fields)
    fields = (
        'title',
        'slug',
        'author',
        'description',
        'content',  # CKEditor5Field
        'published',         # pole wyświetlane jako tylko-do-odczytu
        'updated_article',   # pole wyświetlane jako tylko-do-odczytu
    )
