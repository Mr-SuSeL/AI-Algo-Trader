# api/asgi.py
"""
ASGI config for api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

from chat import routing # Właśnie ten import pozwoli nam podłączyć routing chatu

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

# Główna aplikacja ASGI
application = ProtocolTypeRouter({
    # Standardowe żądania HTTP (czyli Twoje API REST, admin Django itp.)
    # będą obsługiwane przez domyślną aplikację Django (WSGI)
    "http": get_asgi_application(),
    
    # Żądania WebSocket (czyli te z chatu) będą obsługiwane przez Django Channels
    "websocket": AllowedHostsOriginValidator( # Opcjonalnie: zabezpiecza przed połączeniami z nieautoryzowanych domen
        AuthMiddlewareStack( # Ważne: pozwala na dostęp do danych użytkownika (np. czy zalogowany) w WebSocketach
            URLRouter(
                routing.websocket_urlpatterns # Tutaj Django Channels szuka wzorców URL dla WebSocketów
            )
        )
    ),
})