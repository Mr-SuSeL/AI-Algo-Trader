# Dockerfile w katalogu C:\AI-Algo-Trader\backend

# Używamy oficjalnego obrazu Pythona jako bazy
FROM python:3.12-slim-bookworm

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy pliki requirements.txt i requirements-dev.txt (jeśli używasz)
COPY requirements.txt .
# COPY requirements-dev.txt . # Odkomentuj, jeśli masz osobny plik z zależnościami deweloperskimi

# Instalujemy zależności Pythona
# Używamy --no-cache-dir dla mniejszych obrazów
# Używamy --upgrade pip, aby mieć najnowszego pip
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Kopiujemy całą zawartość katalogu backend do katalogu roboczego w kontenerze
COPY . /app

# Expose port 8000, na którym działa Daphne
EXPOSE 8000

# Komenda uruchamiająca serwer Daphne
# Używamy Gunicorn jako serwera WSGI dla HTTP i Daphne dla ASGI (WebSocket)
# Daphne obsługuje ASGI (Channels), Gunicorn obsługuje WSGI (standardowe żądania Django)
# Daphne przyjmuje żądania HTTP i przekazuje je do Gunicorna dla Django, a WebSocket sam obsługuje.
# Wartość 'api.asgi:application' odnosi się do Twojego pliku asgi.py
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "api.asgi:application"]