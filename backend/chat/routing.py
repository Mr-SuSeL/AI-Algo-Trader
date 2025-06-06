# chat/routing.py
from django.urls import re_path

from . import consumers # Będziemy tworzyć ten plik w następnym kroku

# Lista wzorców URL dla połączeń WebSocket
websocket_urlpatterns = [
    # Ta ścieżka będzie obsługiwać połączenia WebSocket do czatu, np. ws://localhost:8000/ws/chat/general/
    # (?P<room_name>\w+) to dynamiczna część, która przechwytuje nazwę pokoju (np. 'general')
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
]