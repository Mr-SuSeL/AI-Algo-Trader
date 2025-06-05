# articles/models.py

from django.db import models
from django.utils.text import slugify
from django.conf import settings
from django_ckeditor_5.fields import CKEditor5Field  # poprawny import

class Article(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = CKEditor5Field(config_name='extends')  # użycie CKEditor5Field
    slug = models.SlugField(unique=True, max_length=100, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    published = models.DateTimeField(auto_now_add=True)
    updated_article = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            unique_slug = base_slug
            counter = 1
            while Article.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-published']

