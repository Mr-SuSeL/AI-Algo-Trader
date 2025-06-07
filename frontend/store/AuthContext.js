// C:\AI-Algo-Trader\frontend\store\AuthContext.js
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchCurrentUser, loginUser, logoutUser, refreshToken, clearAuthCookies, getCookie } from '../utils/auth'; // Dodano getCookie
import { useRouter, usePathname } from 'next/navigation';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Stan 'user' będzie przechowywać dane zalogowanego użytkownika lub null.
  // Stan 'loading' będzie wskazywał, czy trwa pobieranie danych uwierzytelniania.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Domyślnie true, ponieważ zawsze potrzebujemy sprawdzić stan uwierzytelnienia na początku.

  const router = useRouter();
  const pathname = usePathname();
  const intervalId = useRef(null); // Ref do przechowywania ID interwału odświeżania tokena.

  // Funkcja odpowiedzialna za początkowe pobieranie danych użytkownika
  const fetchInitialData = useCallback(async () => {
    console.log('[AuthProvider fetchInitialData] Document cookie on init:', document.cookie);
    setLoading(true); // Ustaw loading na true przed rozpoczęciem pobierania danych.
    try {
      const accessToken = getCookie('access_token');
      if (accessToken) {
        // Jeśli jest token dostępu, próbujemy pobrać dane użytkownika.
        // fetchCurrentUser obsługuje również odświeżanie tokena, jeśli jest wygasły.
        const currentUser = await fetchCurrentUser();
        setUser(currentUser); // Ustawiamy dane użytkownika.
      } else {
        // Jeśli brak tokena, upewniamy się, że ciasteczka autoryzacyjne są czyste i użytkownik to null.
        clearAuthCookies();
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthProvider fetchInitialData] Błąd podczas pobierania danych użytkownika:', error);
      // W przypadku błędu, czyścimy ciasteczka i ustawiamy użytkownika na null.
      clearAuthCookies();
      setUser(null);
    } finally {
      setLoading(false); // Zawsze ustawiamy loading na false po zakończeniu procesu.
      console.log('[AuthProvider fetchInitialData] Initial data fetch completed.');
    }
  }, []); // Pusta tablica zależności, ta funkcja jest stabilna.

  // Funkcja logowania użytkownika
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true); // Włącz stan ładowania podczas próby logowania.
      const loginResponse = await loginUser(email, password); // Wywołanie API logowania.

      // WAŻNE: Natychmiast ustawiamy stan 'user' na podstawie danych zwróconych przez loginUser.
      // To zapewnia, że AuthProvider ma aktualne dane użytkownika przed przekierowaniem.
      if (loginResponse && loginResponse.user) {
        setUser(loginResponse.user);
      } else {
        // W przypadku, gdy loginUser nie zwraca od razu danych użytkownika,
        // pobieramy je, zakładając, że ciasteczka zostały ustawione.
        await fetchCurrentUser();
      }
      setLoading(false); // Wyłączamy stan ładowania po udanym logowaniu.
      router.push('/'); // Przekierowujemy użytkownika na stronę główną.
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false); // Wyłączamy stan ładowania w przypadku błędu.
      throw error;
    }
  }, [router, fetchCurrentUser]); // Zależności: router i fetchCurrentUser.

  // Funkcja wylogowania użytkownika
  const logout = useCallback(async () => {
    try {
      await logoutUser(); // Wywołaj funkcję wylogowania na backendzie.
      clearAuthCookies(); // Usuń ciasteczka po stronie klienta.
      setUser(null); // Wyczyść stan użytkownika.
      if (intervalId.current) {
        clearInterval(intervalId.current); // Zatrzymaj interwał odświeżania tokena.
        intervalId.current = null;
      }
      router.push('/login'); // Przekieruj na stronę logowania.
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  // Funkcja odświeżania tokena
  const refresh = useCallback(async () => {
    try {
      const response = await refreshToken();
      if (response && response.access) {
        console.log("Token refresh successful.");
        // Po odświeżeniu, ponownie pobieramy dane użytkownika, aby upewnić się, że stan jest aktualny
        // (np. jeśli rola użytkownika uległa zmianie).
        await fetchCurrentUser();
      } else {
        console.warn("Token refresh successful, but no access token in response. Logging out.");
        await logout(); // Wyloguj użytkownika, jeśli odświeżanie tokena się nie powiodło.
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      console.log("Token refresh error, logging out.");
      await logout(); // Wyloguj użytkownika w przypadku błędu odświeżania.
    }
  }, [logout, fetchCurrentUser]); // Zależności: logout i fetchCurrentUser.

  // Główny efekt do inicjalizacji danych i konfiguracji interwału
  useEffect(() => {
    // Wywołaj fetchInitialData natychmiast po zamontowaniu komponentu.
    // To uruchomi proces sprawdzania stanu uwierzytelnienia na początku.
    fetchInitialData(); 

    // Ustaw interwał do cyklicznego odświeżania tokena.
    intervalId.current = setInterval(() => {
      console.log('AuthContext: Interval tick.');
      refresh();
    }, 4 * 60 * 1000); // Co 4 minuty.

    // Funkcja czyszcząca, która uruchamia się przy odmontowaniu komponentu.
    return () => {
      console.log('AuthProvider unmounted. Clearing interval.');
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [fetchInitialData, refresh]); // Zależności: fetchInitialData i refresh.

  // Efekt do proaktywnego czyszczenia ciasteczek na stronie logowania
  useEffect(() => {
    // Sprawdzamy, czy użytkownik jest na stronie logowania.
    if (pathname === '/login') {
      // Sprawdzamy, czy w ciasteczkach są tokeny autoryzacji.
      const hasAuthCookies = document.cookie.includes('access_token=') || document.cookie.includes('refresh_token=');
      // Jeśli są ciasteczka, ale użytkownik nie jest ustawiony w stanie i ładowanie się zakończyło,
      // oznacza to, że mamy do czynienia z "zaległymi" ciasteczkami.
      if (hasAuthCookies && !user && !loading) {
        console.log('[AuthContext - Login Page Effect] Znaleziono ciasteczka autoryzacji na stronie logowania bez aktywnej sesji. Proaktywne czyszczenie.');
        clearAuthCookies(); // Wyczyść ciasteczka.
        // Po wyczyszczeniu ciasteczek, wywołujemy fetchInitialData ponownie, aby UI zareagował na czysty stan.
        fetchInitialData(); // Spowoduje to ponowne uruchomienie głównego useEffect.
      }
    }
  }, [pathname, user, loading, fetchInitialData]); // Zależności: pathname, user, loading, fetchInitialData.

  // Zwracamy kontekst, udostępniając stan i funkcje uwierzytelniania.
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook do łatwego dostępu do wartości kontekstu AuthContext.
export const useAuth = () => useContext(AuthContext);
