"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
// Importujemy FUNKCJE API z Twojego pliku utils/auth.js
import { loginUser, logoutUser, refreshToken, getUserInfo } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// Definicja kontekstu
// Wartość początkowa (używana tylko gdy brak Providera)
const AuthContext = createContext({
    isLoggedIn: false,
    user: null,
    isLoading: true,
    login: async () => {}, // Funkcja placeholder
    logout: async () => {},
    refreshToken: async () => {},
    fetchUserInfo: async () => {},
});

// Komponent Provider, który TRZYMA STAN i INTEGRUJE SIĘ Z API
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // --- FUNKCJA GŁÓWNA DO SPRAWDZANIA STATUSU ---
    // Ta funkcja próbuje pobrać dane usera. Jeśli się uda, użytkownik jest zalogowany.
    // Jeśli API zwróci błąd (np. 401/403), oznacza to, że tokeny są nieważne/brak ich, więc użytkownik jest wylogowany.
    const fetchUserInfo = async () => {
         try {
             // isLoading = true; // Możesz dodać lokalne ładowanie w tej funkcji, ale główny isLoading Providera wystarczy
             const userData = await getUserInfo(); // <-- Wywołaj FUNKCJĘ API z utils/auth.js
             // Jeśli linia powyżej się powiedzie, cookie było ważne:
             setUser(userData);
             setIsLoggedIn(true);
             // isLoading = false;
             return userData; // Zwróć dane, mogą być potrzebne
         } catch (error) {
             // Jeśli linia powyżej RZUCI BŁĄD (np. 401/403 od API), cookie było nieważne/brak go:
             console.error("Auth check failed. User is not logged in.", error);
             setIsLoggedIn(false);
             setUser(null);
             // isLoading = false;
             // Nie rzucamy błędu dalej, bo to rutynowe sprawdzanie statusu.
         }
    };

    // --- FUNKCJE WYWOŁUJĄCE API I AKTUALIZUJĄCE STAN PRZEZ fetchUserInfo ---

    // Funkcja do ZALOGOWANIA
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            // Wywołaj FUNKCJĘ API logowania (ona używa axios i powinna otrzymać/ustawić cookies)
            await loginUser(email, password);

            // PO Pomyślnym logowaniu API, SPRAWDŹ NA NOWO STATUS!
            // fetchUserInfo() teraz odczyta NOWE, ustawione cookies i zaktualizuje isLoggedIn/user
            await fetchUserInfo();

            console.log("Login successful. State updated.");

        } catch (error) {
             console.error("Login failed:", error);
             // W przypadku błędu logowania API, fetchUserInfo (wywołane wyżej lub jeśli pominiesz to wywołanie)
             // i tak ustawi stan na wylogowany, ale możesz to zrobić explicite:
             setIsLoggedIn(false);
             setUser(null);
             throw error; // Przekaż błąd dalej
        } finally {
             setIsLoading(false);
        }
    };

    // Funkcja do WYLOGOWANIA
    const logout = async () => {
        try {
            setIsLoading(true);
            // Wywołaj FUNKCJĘ API wylogowania (ona używa axios i powinna poprosić backend o usunięcie cookies)
            await logoutUser();

             // PO Pomyślnym wylogowaniu API, SPRAWDŹ NA NOWO STATUS!
             // fetchUserInfo() teraz odczyta BRAK cookies i zaktualizuje isLoggedIn=false/user=null
            await fetchUserInfo(); // Sprawdzamy status po wylogowaniu

            console.log("Logout successful. State updated.");

        } catch (error) {
             console.error("Logout failed:", error);
             // Nawet jeśli API wylogowania nie zadziałało, po stronie klienta spróbuj zaktualizować stan
             // fetchUserInfo() i tak ustawi isLoggedIn=false, bo cookies prawdopodobnie nie działają
             await fetchUserInfo(); // Mimo błędu API, zaktualizuj stan frontendu
             throw error; // Przekaż błąd dalej
        } finally {
             setIsLoading(false);
             router.push('/login'); // Przekierowanie po wylogowaniu
        }
    };

     // Funkcja do ODŚWIEŻANIA TOKENU
    const refreshAuthToken = async () => {
         try {
             setIsLoading(true);
             // Wywołaj FUNKCJĘ API odświeżania tokenu (ona używa axios i powinna wysłać refresh cookie i otrzymać nowy access cookie)
             await refreshToken();

             // PO Pomyślnym odświeżeniu API, SPRAWDŹ NA NOWO STATUS!
             // fetchUserInfo() teraz odczyta NOWE, odświeżone access cookie i zaktualizuje isLoggedIn/user
             await fetchUserInfo(); // Sprawdzamy status po odświeżeniu

             console.log("Token refreshed. State updated.");

         } catch (error) {
             console.error("Refresh failed:", error);
             // Jeśli odświeżenie NIE POWIODŁO SIĘ (np. refresh cookie wygasło), status autoryzacji jest stracony
             // fetchUserInfo() (wywołane poniżej lub jeśli pominiesz to wywołanie) i tak ustawi stan na wylogowany
             await fetchUserInfo(); // Sprawdzamy status po błędzie odświeżenia (ustawi isLoggedIn=false)
             throw error; // Przekaż błąd dalej
         } finally {
              setIsLoading(false);
         }
    };

    // --- EFEKT SPRAWDZAJĄCY STATUS PRZY STARTCIE APLIKACJI ---
    useEffect(() => {
        console.log("AuthProvider mounted. Checking auth status...");
        setIsLoading(true); // Zaczynamy ładowanie przy starcie
        // Przy starcie, po prostu spróbuj pobrać dane użytkownika.
        // Funkcja fetchUserInfo() sama ustawi isLoggedIn i user na podstawie wyniku.
        fetchUserInfo().finally(() => {
             // Zakończ ładowanie po zakończeniu initial check
              setIsLoading(false);
        });
    }, []); // Pusta tablica zależności - efekt uruchamia się tylko raz przy montowaniu Providera

    // --- WARTOŚĆ UDOSTĘPNIANA PRZEZ KONTEKST ---
    const contextValue = {
        isLoggedIn,      // Status zalogowania (do odczytu)
        user,            // Dane użytkownika (obiekt lub null)
        isLoading,       // Czy Context aktywnie sprawdza/zmienia stan autoryzacji
        login,           // Funkcja do logowania (wywołaj np. w LoginPage)
        logout,          // Funkcja do wylogowania (wywołaj np. w Navbar)
        refreshToken: refreshAuthToken, // Funkcja do odświeżania tokenu
        fetchUserInfo,   // Funkcja do ręcznego sprawdzenia/odświeżenia statusu (rzadziej potrzebna bezpośrednio)
        // NIE udostępniamy setterów typu setIsLoggedIn, bo logika zmiany stanu jest w funkcjach login/logout/etc.
    };

    // --- RENDEROWANIE PROVIDERA ---
    // Opcjonalnie: Pokaż loader, gdy sprawdzamy status autoryzacji
     if (isLoading) {
         return <div>Ładowanie autoryzacji...</div>; // Prosty loader blokujący renderowanie reszty UI zależnego od statusu
     }

    return (
        <AuthContext.Provider value={contextValue}>
            {children} {/* Reszta Twojej aplikacji */}
        </AuthContext.Provider>
    );
};

// Pamiętaj, żeby zaimportować i użyć AuthProvider w app/layout.js, owijając nim <Navbar /> i {children}.
// W komponentach, które potrzebują statusu lub funkcji (np. LoginPage, Navbar), importuj AuthContext i używaj useContext(AuthContext).



