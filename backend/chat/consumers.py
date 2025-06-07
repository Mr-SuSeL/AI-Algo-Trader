# chat/consumers.py
import json # Moduł do pracy z danymi JSON
import datetime # Dodajemy import datetime do generowania timestampów

# Importujemy AsyncWebsocketConsumer z Channels, to jest bazowa klasa do obsługi WebSocketów
from channels.generic.websocket import AsyncWebsocketConsumer
# Importujemy async_to_sync, potrzebne jeśli mielibyśmy synchroniczne wywołania do Redis w async consumerze,
# ale w AsyncWebsocketConsumer możemy używać await bezpośrednio
# from asgiref.sync import async_to_sync

class ChatConsumer(AsyncWebsocketConsumer):
    # Ta metoda jest wywoływana, gdy klient łączy się z WebSocketem
    async def connect(self):
        # Pobieramy nazwę pokoju z adresu URL, np. 'general' z ws/chat/general/
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        # Tworzymy unikalną nazwę grupy dla tego pokoju, np. 'chat_general'
        self.room_group_name = f"chat_{self.room_name}"

        # Akceptujemy połączenie WebSocket. Bez tego połączenie nie zostanie nawiązane.
        await self.accept()
        print(f"WS: Połączono z {self.channel_name} w pokoju {self.room_name}") # Dodany log

        # Dołączamy bieżące połączenie (kanał) do grupy pokoju w Channel Layer (Redis)
        # Dzięki temu wszystkie połączenia w tej samej grupie mogą się ze sobą komunikować
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        print(f"WS: Dodano {self.channel_name} do grupy: {self.room_group_name}") # Dodany log dla testów

    # Ta metoda jest wywoływana, gdy klient rozłącza się z WebSocketem
    async def disconnect(self, close_code):
        # Usuwamy połączenie z grupy pokoju
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WS: Rozłączono {self.channel_name} z kodem {close_code} z pokoju {self.room_group_name}") # Dodany log

    # Ta metoda jest wywoływana, gdy konsumer odbiera wiadomość z WebSocket (od frontendu)
    async def receive(self, text_data):
        # Analizujemy (parsowanie) wiadomość JSON
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        username = text_data_json.get("username", "Anonymous") # Pobierz nazwę użytkownika, domyślnie "Anonymous"
        # Odbieramy timestamp z frontendu. Jeśli frontend go nie wysłał, ustawiamy aktualny czas.
        timestamp = text_data_json.get("timestamp", datetime.datetime.now().isoformat())

        print(f"WS: Otrzymano od {username}: {message} (Timestamp: {timestamp}) w pokoju {self.room_name}") # Dodany log

        # Wysyłamy wiadomość do grupy pokoju w Channel Layer
        # 'type': 'chat.message' oznacza, że Channel Layer wywoła metodę 'chat_message'
        # we wszystkich konsumerach należących do tej grupy
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": message,
                "username": username,
                "timestamp": timestamp, # <-- Przekazujemy timestamp dalej
            }
        )
        print(f"WS: Wiadomość '{message}' wysłana do grupy '{self.room_group_name}'") # Dodany log

    # TA METODA JEST KRYTYCZNA DO ROZSYŁANIA WIADOMOŚCI
    # Ta metoda jest wywoływana, gdy konsumer odbiera wiadomość z Channel Layer (rozsyłaną z innej części aplikacji)
    async def chat_message(self, event):
        message = event["message"]
        username = event["username"]
        timestamp = event["timestamp"] # <-- Odbieramy timestamp z eventu group_send

        print(f"WS: Wysyłam wiadomość '{message}' od '{username}' (Timestamp: {timestamp}) do klienta {self.channel_name}") # Dodany log

        # Wysyłamy wiadomość z powrotem do klienta przez WebSocket
        await self.send(text_data=json.dumps({
            "message": message,
            "username": username,
            "timestamp": timestamp # <-- Wysyłamy timestamp do frontendu
        }))