// frontend/store/AuthContext.js

"use client"; // To jest dyrektywa Next.js dla komponentów klienckich

import React, { createContext, useContext, useState, useEffect } from 'react';
// Ważne: upewnij się, że getCookie jest zaimportowane tutaj z utils/auth!
import { loginUser, logoutUser, refreshToken, getUserInfo, getCookie } from '@/utils/auth'; 
import { useRouter } from 'next/navigation';
import axios from 'axios'; // Potrzebne do pobrania initial CSRF tokena

// Tworzymy kontekst autentykacji
export const AuthContext = createContext(null);

// Komponent Provider, który będzie udostępniał stan i funkcje autentykacji
export const AuthProvider = ({ children }) => {
    // Stany dla zarządzania autentykacją
    const [user, setUser] = useState(null); // Obiekt użytkownika
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Czy użytkownik jest zalogowany
    const [isLoading, setIsLoading] = useState(true); // Czy kontekst się inicjalizuje (np. pobiera CSRF)
    const [csrfToken, setCsrfToken] = useState(null); // Stan na przechowywanie tokena CSRF

    const router = useRouter(); // Hook do nawigacji w Next.js

    // Funkcja do pobierania informacji o użytkowniku i inicjalnego tokena CSRF
    const fetchInitialData = async () => {
        try {
            // Krok 1: ZAWSZE próbujemy pobrać ciasteczko CSRF na początku,
            // niezależnie od tego, czy csrfToken jest już w stanie.
            // Zapewnia to, że zawsze mamy aktualny token.
            await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
            
            // Krok 2: Odczytujemy ciasteczko CSRF po żądaniu
            const initialCsrf = getCookie('csrftoken');
            if (initialCsrf) {
                setCsrfToken(initialCsrf); // Ustawiamy token w stanie
                console.log("Initial CSRF token obtained and set in state:", initialCsrf);
            } else {
                console.warn("CSRF token not found after initial fetch. This might be an issue with cookie attributes.");
                // Jeśli CSRF nie ma, nie ma sensu próbować getUserInfo ani logować.
                // Ustawiamy isLoading na false, aby UI mogło się załadować.
                setIsLoading(false);
                return; // Przerwij dalsze wykonanie funkcji
            }

            // Krok 3: Po pomyślnym pobraniu CSRF, spróbuj pobrać informacje o użytkowniku.
            // To żądanie jest wykonywane po załadowaniu strony.
            // Jeśli użytkownik NIE jest zalogowany (co jest typowe na stronie logowania),
            // spodziewamy się błędu 403 (Forbidden), ponieważ endpoint user-info
            // wymaga uwierzytelnienia (np. tokena JWT w ciasteczkach).
            try {
                const userData = await getUserInfo(); // getUserInfo wysyła cookies (w tym JWT) automatycznie
                setUser(userData.user); // Ustawiamy dane użytkownika
                setIsLoggedIn(true); // Użytkownik jest zalogowany
                console.log("User info fetched successfully:", userData.user);
            } catch (authError) {
                console.warn("User info fetch failed (expected if not logged in yet):", authError.message);
                // To jest normalne zachowanie, jeśli użytkownik nie jest uwierzytelniony.
                // Nie zmieniamy isLoggedIn na false tutaj, bo jest on zarządzany przez login/logout.
            }

        } catch (error) {
            console.error("Auth check failed during initial data fetch (CSRF or other network issue):", error);
            setIsLoggedIn(false); // Ustawiamy stan na niezalogowany
            setUser(null); // Czyścimy dane użytkownika
            setCsrfToken(null); // Czyścimy token CSRF
        } finally {
            setIsLoading(false); // Zawsze ustaw na false po zakończeniu inicjalizacji
        }
    };

    // Funkcja do logowania użytkownika
    const login = async (email, password) => {
        try {
            // Sprawdzamy, czy csrfToken jest dostępny w stanie kontekstu.
            // Jeśli nie, próbujemy go odzyskać bezpośrednio z ciasteczka.
            // Sytuacja, gdzie csrfToken w stanie jest null, a w ciasteczku istnieje,
            // może wskazywać na problem z synchronizacją stanu (race condition).
            let currentCsrf = csrfToken;
            if (!currentCsrf) {
                console.warn("CSRF token was null in state during login attempt. Re-fetching from cookie.");
                // Ponowne pobranie tokena CSRF, aby upewnić się, że jest świeży i dostępny
                await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
                currentCsrf = getCookie('csrftoken'); // Ponownie odczytujemy ciasteczko
                if (!currentCsrf) {
                    console.error("CSRF token still missing after re-fetch attempt for login.");
                    throw new Error("Security error: CSRF token missing.");
                }
                setCsrfToken(currentCsrf); // Aktualizujemy stan, jeśli znaleziono
                console.log("Re-fetched CSRF token for login and updated state:", currentCsrf);
            }

            // Wywołujemy funkcję loginUser z utils/auth, przekazując pobrany token CSRF
            const responseData = await loginUser(email, password, currentCsrf); 
            setUser(responseData.user); // Ustawiamy zalogowanego użytkownika
            setIsLoggedIn(true); // Ustawiamy stan na zalogowany
            console.log("Login successful, user set:", responseData.user);

            // Używamy setTimeout z opóźnieniem 0, aby router.push został wywołany
            // po zakończeniu bieżącego cyklu renderowania.
            setTimeout(() => {
                router.push('/'); // Przekierowujemy na stronę główną po zalogowaniu
            }, 0);
            

        } catch (error) {
            console.error("Login failed in AuthContext:", error);
            setUser(null); // Czyścimy dane użytkownika
            setIsLoggedIn(false); // Ustawiamy stan na niezalogowany
            throw error; // Propagujemy błąd dalej
        }
    };

    // Funkcja do wylogowania użytkownika
    const logout = async () => {
        try {
            let currentCsrf = csrfToken;
            if (!currentCsrf) { 
                console.warn("CSRF token missing in state for logout. Attempting re-fetch.");
                await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
                currentCsrf = getCookie('csrftoken');
                if (currentCsrf) {
                    setCsrfToken(currentCsrf);
                } else {
                    console.warn("CSRF token still missing after re-fetch for logout, proceeding without header.");
                }
            }
            // Wywołujemy funkcję logoutUser z utils/auth, przekazując token CSRF
            await logoutUser(currentCsrf); 
            setUser(null); // Czyścimy dane użytkownika
            setIsLoggedIn(false); // Ustawiamy stan na niezalogowany
            setCsrfToken(null); // Czyścimy token CSRF po wylogowaniu
            console.log("User logged out successfully.");
            router.push('/login'); // Przekierowujemy na stronę logowania
        } catch (error) {
            console.error("Logout failed in AuthContext:", error);
            // Nadal czyścimy stan frontendu, nawet jeśli backend zwrócił błąd wylogowania
            setUser(null);
            setIsLoggedIn(false);
            setCsrfToken(null);
        }
    };

    // Funkcja do odświeżania tokenów JWT (jeśli używasz)
    const refresh = async () => {
        try {
            let currentCsrf = csrfToken;
            if (!currentCsrf) { 
                console.error("CSRF token missing in state for token refresh. Attempting re-fetch.");
                await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
                currentCsrf = getCookie('csrftoken');
                if (currentCsrf) {
                    setCsrfToken(currentCsrf);
                } else {
                    console.error("Security error: CSRF token still missing for refresh after re-fetch.");
                    throw new Error("Security error: CSRF token missing for refresh.");
                }
            }
            // Wywołujemy funkcję refreshToken z utils/auth, przekazując token CSRF
            await refreshToken(currentCsrf); 
            // Po odświeżeniu tokena, tokeny JWT są już w ciasteczkach.
            // Możemy ponownie spróbować pobrać informacje o użytkowniku, aby zaktualizować UI.
            await fetchInitialData(); // Odświeżamy dane użytkownika
            console.log("Token refreshed successfully.");
        } catch (error) {
            console.error("Token refresh failed in AuthContext:", error);
            setUser(null); // Czyścimy dane użytkownika
            setIsLoggedIn(false); // Ustawiamy stan na niezalogowany
            router.push('/login'); // Jeśli odświeżenie nie powiedzie się, przekieruj na login
            throw error; // Propagujemy błąd dalej
        }
    };

    // Efekt uruchamiany tylko raz po zamontowaniu komponentu
    useEffect(() => {
        console.log("AuthProvider mounted. Fetching initial data...");
        fetchInitialData();
    }, []); // Pusta tablica zależności - efekt uruchamia się tylko raz

    // Wartości, które będą udostępniane przez kontekst innym komponentom
    const contextValue = {
        user,
        isLoggedIn,
        isLoading, // Udostępniamy stan ładowania
        login,
        logout,
        refreshToken: refresh, // Zmieniamy nazwę funkcji, aby uniknąć konfliktu nazw
        csrfToken // Udostępniamy CSRF token w kontekście
    };

    // Jeśli dane się ładują, wyświetlamy prosty loader
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
                Ładowanie danych uwierzytelniania...
            </div>
        ); 
    }

    // Gdy dane są załadowane, renderujemy dzieci otoczone kontekstem
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// WAŻNE: Funkcja getCookie została przeniesiona do utils/auth.js i jest importowana.
// Upewnij się, że została usunięta z tego pliku, aby uniknąć duplikacji.