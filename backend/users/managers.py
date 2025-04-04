from django.contrib.auth.models import BaseUserManager

# Nadpisuję w managerze username w superuser jako email
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password) # hashowanie pola hasło
        user.save() # zapis do bazy danych
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True) # no bo w końcu admin
        extra_fields.setdefault("is_superuser", True) 

        if not extra_fields.get("is_staff"):
            raise ValueError("Super user must be the stuff")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Are You super user or not?")
        return self.create_user(email, password, **extra_fields)
    