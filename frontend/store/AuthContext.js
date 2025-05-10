"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, refreshToken, getUserInfo } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// Definicja kontekstu - używana tylko gdy brak Providera
export const AuthContext = createContext({
    isLoggedIn: false,
    user: null,
    isLoading: true,
    login: async () => {}, 
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

    // Ta funkcja próbuje pobrać dane usera. Jeśli się uda, użytkownik jest zalogowany.
    // Jeśli API zwróci błąd (np. 401/403), oznacza to, że tokeny są nieważne/brak ich, więc użytkownik jest wylogowany.
    const fetchUserInfo = async () => {
         try {
             // isLoading = true; // Możesz dodać lokalne ładowanie w tej funkcji, ale główny isLoading Providera wystarczy
             const userData = await getUserInfo(); // z API z utils/auth.js, jeśli się powiedzie, cookie było ważne

             setUser(userData);
             setIsLoggedIn(true);
             // isLoading = false;
             return userData; 
         } catch (error) {
             // Jeśli linia powyżej RZUCI BŁĄD (np. 401/403 od API), cookie było nieważne/brak go:
             console.error("Auth check failed. User is not logged in.", error);
             setIsLoggedIn(false);
             setUser(null);
             // isLoading = false;
         }
    };

    // Funkcja do ZALOGOWANIA
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            // Wysyła dane do endpointu z danymi do logowania, używa axios i powinna otrzymać/ustawić cookies)
            await loginUser(email, password);

            // odczytujemy  ustawione cookies i aktualizujemy isLoggedIn/user
            await fetchUserInfo();

            console.log("Login successful. State updated.");

        } catch (error) {
             console.error("Login failed:", error);
             setIsLoggedIn(false);
             setUser(null);
             throw error; 
        } finally {
             setIsLoading(false);
        }
    };

    // Funkcja do WYLOGOWANIA
    const logout = async () => {
        try {
            setIsLoading(true);
            // strzał do API celem wylogowania
            await logoutUser();

             // teraz odczytamy status ustawiając BRAK cookies i aktualizując isLoggedIn=false/user=null
            await fetchUserInfo(); // Sprawdzamy status po wylogowaniu
            console.log("Logout successful. State updated.");

        } catch (error) {
             console.error("Logout failed:", error);
             // Nawet jeśli API wylogowania nie zadziałało, po stronie klienta aktualizujemy stan
             // fetchUserInfo() i tak ustawi isLoggedIn=false, bo cookies prawdopodobnie nie działają
             await fetchUserInfo(); // Mimo błędu API, zaktualizuj stan frontendu
             throw error; // Przekaż błąd dalej
        } finally {
             setIsLoading(false);
             router.push('/login'); // Przekierowanie po wylogowaniu na stronę logowania (a może główną?)
        }
    };

     // Funkcja do ODŚWIEŻANIA TOKENU
     // --> docelowo modal z zapytaniem o to czy user chce pozostać zalogowanym
    const refreshAuthToken = async () => {
         try {
             setIsLoading(true);
             // FUNKCJA API odświeżania tokenu (przez axios powinna wysłać refresh cookie i otrzymać nowy access cookie)
             await refreshToken(); //z auth.js

             // odczytujemy NOWE, odświeżone access cookie i aktualizujemy: isLoggedIn/user
             await fetchUserInfo(); // Sprawdzamy status po odświeżeniu

             console.log("Token refreshed. State updated.");

         } catch (error) {
             console.error("Refresh failed:", error);
             // Jeśli odświeżenie NIE POWIODŁO SIĘ (np. refresh cookie wygasło), status autoryzacji jest stracony
             // fetchUserInfo() i tak ustawi stan na wylogowany
             await fetchUserInfo(); // Sprawdzamy status po błędzie odświeżenia (ustawi isLoggedIn=false)
             throw error; // Przekaż błąd dalej
         } finally {
              setIsLoading(false);
         }
    };

    // EFEKT SPRAWDZAJĄCY STATUS PRZY STARCIE APLIKACJI 
    useEffect(() => {
        console.log("AuthProvider mounted. Checking auth status...");
        setIsLoading(true); // Zaczynamy ładowanie przy starcie
        // Przy starcie, próbujemy pobrać dane użytkownika, funkcja fetchUserInfo() sama ustawi isLoggedIn i user na podstawie wyniku.
        fetchUserInfo().finally(() => {
             // Zakończ ładowanie po zakończeniu initial check
              setIsLoading(false);
        });
    }, []); // Pusta tablica zależności - efekt uruchamia się tylko raz przy montowaniu Providera

    // WARTOŚĆ UDOSTĘPNIANA PRZEZ KONTEKST
    const contextValue = {
        isLoggedIn,      // Status zalogowania (do odczytu)
        user,            // Dane użytkownika (obiekt lub null)
        isLoading,       // Czy Context aktywnie sprawdza/zmienia stan autoryzacji
        login,           // Funkcja do logowania (wywołaj np. w LoginPage)
        logout,          // Funkcja do wylogowania (wywołaj np. w Navbar)
        refreshToken: refreshAuthToken, // Funkcja do odświeżania tokenu
        fetchUserInfo,   // Funkcja do ręcznego sprawdzenia/odświeżenia statusu
        // logika zmiany stanu jest w funkcjach login/logout/etc.
    };

    // --- RENDEROWANIE PROVIDERA ---
    // Opcjonalnie: Pokaż loader, gdy sprawdzamy status autoryzacji
     if (isLoading) {
         return <div>Loading auth credentials ...</div>; // Prosty loader blokujący renderowanie reszty UI zależnego od statusu
     }

    return (
        <AuthContext.Provider value={contextValue}>
            {children} {/* Reszta Twojej aplikacji */}
        </AuthContext.Provider>
    );
};

// Pamiętaj, żeby zaimportować i użyć AuthProvider w app/layout.js, owijając nim <Navbar /> i {children}.
// W komponentach, które potrzebują statusu lub funkcji (np. LoginPage, Navbar), importuj AuthContext i używaj useContext(AuthContext).



