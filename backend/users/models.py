from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager

class CustomUser(AbstractUser):
    USERNAME_FIELD = 'email'
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=30, unique=True, blank=True, null=True) # Dodaj pole nicku
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.nickname if self.nickname else self.email # Wyświetlaj nick, a jeśli go nie ma, to email