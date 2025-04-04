
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import CustomUserSerializer, RegisterUserSerializer, LoginUserSerializer
from rest_framework.views import APIView 
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken

class UserInfoView(RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer

    def get_object(self):
        return self.request.user
    
class UserRegistrationView(CreateAPIView):
    serializer_class = RegisterUserSerializer
    
class LoginView(APIView):
    # robimy POST request do end-pointa
    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)

        # generowanie tokena użytkownika
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = Response({"user": CustomUserSerializer(user).data},
                                status=status.HTTP_200_OK)
            # ustaw ciasteczko
            response.set_cookie(key="access_token", value=access_token,
                                # aby JavaScript nie miał dostępu
                                httponly=True, secure=True, samesite="None")
            
            response.set_cookie(key="refresh_token", value=str(refresh),
                                httponly=True, secure=True, samesite="None")
            return response
        return Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST )
    
# Logout
class LogoutView(APIView):

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                 # blacklisting token - logout
                refresh.blacklist()
            except Exception as e:
                return Response({"error": "Error invalidating token " + str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        response = Response({"message": "Succesfully logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response
    
# odświeżanie tokena - podtrzymanie zalogowania
# ...do dokończenia na widoku
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error":"Refresh token not provided"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            response = Response({"message":"Acces token refreshed succesfully"}, status=status.HTTP_200_OK)
            response.set_cookie(key="access_token", value=access_token,
                                httponly=True, secure=True, samesite="None") # None lub Strict
            return response
        
        except InvalidToken:
            return Response({"error":"Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        
        

           
        
       




