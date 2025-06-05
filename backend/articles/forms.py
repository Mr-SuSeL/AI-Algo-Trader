# backend/articles/forms.py

from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget
from .models import Article

class ArticleRegistrationForm(forms.ModelForm):
    """
    Formularz używany w panelu Admin do tworzenia nowego artykułu.
    Zawiera pola title, slug, author, description i content (z CKEditor 5).
    """
    class Meta:
        model = Article
        fields = ['title', 'slug', 'author', 'description', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'slug': forms.TextInput(attrs={'class': 'form-control'}),
            'author': forms.Select(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'content': CKEditor5Widget(
                attrs={'class': 'django_ckeditor_5'},
                config_name='extends'
            ),
        }

class ArticleUpdateForm(forms.ModelForm):
    """
    Formularz używany w panelu Admin do edytowania istniejącego artykułu.
    Zawiera pola title, slug, description i content (z CKEditor 5).
    Pole author nie jest edytowalne przy update (zazwyczaj nie zmieniamy autora).
    """
    class Meta:
        model = Article
        fields = ['title', 'slug', 'description', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'slug': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'content': CKEditor5Widget(
                attrs={'class': 'django_ckeditor_5'},
                config_name='extends'
            ),
        }
