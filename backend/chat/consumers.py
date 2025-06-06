# chat/consumers.py
import json # Moduł do pracy z danymi JSON

# Importujemy AsyncWebsocketConsumer z Channels, to jest bazowa klasa do obsługi WebSocketów
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    # Ta metoda jest wywoływana, gdy klient łączy się z WebSocketem
    async def connect(self):
        # Pobieramy nazwę pokoju z adresu URL, np. 'general' z ws/chat/general/
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        # Tworzymy unikalną nazwę grupy dla tego pokoju, np. 'chat_general'
        self.room_group_name = f"chat_{self.room_name}"

        # Dołączamy bieżące połączenie (kanał) do grupy pokoju w Channel Layer (Redis)
        # Dzięki temu wszystkie połączenia w tej samej grupie mogą się ze sobą komunikować
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Akceptujemy połączenie WebSocket. Bez tego połączenie nie zostanie nawiązane.
        await self.accept()

    # Ta metoda jest wywoływana, gdy klient rozłącza się z WebSocketem
    async def disconnect(self, close_code):
        # Usuwamy połączenie z grupy pokoju
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Ta metoda jest wywoływana, gdy konsumer odbiera wiadomość z WebSocket (od frontendu)
    async def receive(self, text_data):
        # Analizujemy (parsowanie) wiadomość JSON
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        username = text_data_json.get("username", "Anonymous") # Pobierz nazwę użytkownika, domyślnie "Anonymous"

        # Wysyłamy wiadomość do grupy pokoju w Channel Layer
        # 'type': 'chat.message' oznacza, że Channel Layer wywoła metodę 'chat_message'
        # we wszystkich konsumerach należących do tej grupy
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": message,
                "username": username
            }
        )

    # Ta metoda jest wywoływana, gdy konsumer odbiera wiadomość z Channel Layer (rozsyłaną z innej części aplikacji)
    async def chat_message(self, event):
        message = event["message"]
        username = event["username"]

        # Wysyłamy wiadomość z powrotem do klienta przez WebSocket
        await self.send(text_data=json.dumps({"message": message, "username": username}))