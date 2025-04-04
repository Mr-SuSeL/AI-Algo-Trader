from django.contrib import admin
from .models import CustomUser

# To zmienia nagłówek
admin.site.site_header = "AI Algo Trader Dashboard"

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    pass