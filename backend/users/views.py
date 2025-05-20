# users/views.py

from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny # <-- DODAJ AllowAny
from rest_framework.request import Request
from .serializers import CustomUserSerializer, RegisterUserSerializer, LoginUserSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken

class UserInfoView(RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,) # To zostaje, bo user musi być zalogowany, żeby dostać swoje info
    serializer_class = CustomUserSerializer
    
    def get_object(self):
        return self.request.user

class UserRegistrationView(CreateAPIView):
    permission_classes = (AllowAny,) # <-- DODAJ TO: Zezwól na dostęp publiczny do rejestracji
    serializer_class = RegisterUserSerializer


class LoginView(APIView):
    permission_classes = (AllowAny,) # <-- KLUCZOWE: DODAJ TO. Zezwól na dostęp publiczny do logowania
    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            response = Response({
                "user": CustomUserSerializer(user).data},
                                status=status.HTTP_200_OK)
            
            # Ważna uwaga: secure=True dla http://localhost/ NIE ZADZIAŁA.
            # secure=True wymaga HTTPS. Dla dewelopmentu na localhost ustaw secure=False.
            # Zmień na True, gdy przejdziesz na produkcję z HTTPS.
            response.set_cookie(key="access_token", 
                                value=access_token,
                                httponly=True,
                                secure=False, # <-- ZMIEŃ NA FALSE DLA LOKALNEGO DEWELOPMENTU
                                samesite="Lax") # Zmień None na Lax dla większej kompatybilności z przeglądarkami

            response.set_cookie(key="refresh_token",
                                value=str(refresh),
                                httponly=True,
                                secure=False, # <-- ZMIEŃ NA FALSE DLA LOKALNEGO DEWELOPMENTU
                                samesite="Lax") # Zmień None na Lax
            
            return response
        return Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,) # To zostaje, bo user musi być zalogowany, żeby się wylogować
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except Exception as e:
                # Lepsza obsługa błędu, jeśli token jest już na czarnej liście lub nieważny
                return Response({"error":"Error invalidating token: " + str(e) }, status=status.HTTP_400_BAD_REQUEST)
        
        response = Response({"message": "Successfully logged out!"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        # Jeśli używasz django.contrib.sessions, możesz też usunąć ciasteczko sesyjne i csrf
        # response.delete_cookie("sessionid") 
        # response.delete_cookie("csrftoken") 
        
        return response     

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request):
        
        refresh_token = request.COOKIES.get("refresh_token")
        
        if not refresh_token:
            return Response({"error":"Refresh token not provided"}, status= status.HTTP_401_UNAUTHORIZED)
    
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            response = Response({"message": "Access token token refreshed successfully"}, status=status.HTTP_200_OK)
            response.set_cookie(key="access_token", 
                                value=access_token,
                                httponly=True,
                                secure=False, # <-- ZMIEŃ NA FALSE DLA LOKALNEGO DEWELOPMENTU
                                samesite="Lax") # Zmień None na Lax
            return response
        except InvalidToken:
            return Response({"error":"Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
       




