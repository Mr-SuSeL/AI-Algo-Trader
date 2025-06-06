# api/asgi.py
"""
ASGI config for api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

# from channels.auth import AuthMiddlewareStack # <-- ZAKOMENTOWANO TĘ LINIĘ
from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator # <-- ZAKOMENTOWANO TĘ LINIĘ
from django.core.asgi import get_asgi_application

from chat import routing # Właśnie ten import pozwoli nam podłączyć routing chatu

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

# Główna aplikacja ASGI
application = ProtocolTypeRouter({
    # Standardowe żądania HTTP (czyli Twoje API REST, admin Django itp.)
    # będą obsługiwane przez domyślną aplikację Django (WSGI)
    "http": get_asgi_application(),
    
    # Żądania WebSocket (czyli te z chatu) będą obsługiwane przez Django Channels
    # Usunięto AllowedHostsOriginValidator i AuthMiddlewareStack tymczasowo w celach diagnostycznych
    "websocket": URLRouter( # <-- Usunięto AuthMiddlewareStack tymczasowo
        routing.websocket_urlpatterns # Tutaj Django Channels szuka wzorców URL dla WebSocketów
    ),
})
