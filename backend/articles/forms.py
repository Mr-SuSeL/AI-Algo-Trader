from django import forms
from django.contrib.auth.models import User
from .models import Article

class ArticleRegistrationForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'description', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control'}),
            'slug': forms.TextInput(attrs={'class': 'form-control'}),
            'author': forms.Select(attrs={'class': 'form-control'}),
        }