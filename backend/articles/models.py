from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.conf import settings # Dodaj ten import

class Article(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = models.TextField()
    slug = models.SlugField(unique=True, max_length=100, blank=True)
    #author = models.CharField(max_length=100)
    # For future for more authors:
    #from django.contrib.auth.models import User # Usuń ten import
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) # Użyj settings.AUTH_USER_MODEL
    published = models.DateTimeField(auto_now_add=True)
    updated_article = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:  # Generate slug only if don't exists
            base_slug = slugify(self.title)
            unique_slug = base_slug
            counter = 1

            # checking unique slug in another titles - and add '-1', '-2' etc.
            while Article.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1

        self.slug = unique_slug

        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-published']

