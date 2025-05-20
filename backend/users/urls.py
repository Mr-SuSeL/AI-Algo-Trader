# users/urls.py

from django.urls import path
# Upewnij się, że get_csrf_token NIE JEST tutaj importowane z .views
from .views import UserInfoView, UserRegistrationView, LoginView, LogoutView, CookieTokenRefreshView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

# WAŻNE: Funkcja get_csrf_token MUSI być zdefiniowana W TYM PLIKU (users/urls.py)
# Jeśli masz ją w users/views.py, to usuń ten blok i upewnij się, że jest zaimportowana powyżej.
# Ale jeśli jest w views.py, to nazwa pliku views.py też musi być zmieniona, aby import się zgadzał.
# Najbezpieczniej dla Twojego przypadku jest, aby była tutaj:
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set"})

urlpatterns = [
    path("user-info/", UserInfoView.as_view(), name="user-info"),
    path("register/", UserRegistrationView.as_view(), name="register-user"),
    path("login/", LoginView.as_view(), name="user-login"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    
    # Ta linia jest kluczowa. Używamy funkcji zdefiniowanej powyżej.
    path('csrf-token/', get_csrf_token, name='csrf_token'), 
]
