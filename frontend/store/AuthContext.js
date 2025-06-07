// C:\AI-Algo-Trader\frontend\store\AuthContext.js
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchCurrentUser, loginUser, logoutUser, refreshToken, clearAuthCookies, getCookie } from '../utils/auth';
import { useRouter, usePathname } from 'next/navigation';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const intervalId = useRef(null);

  // Funkcja odpowiedzialna za początkowe pobieranie danych użytkownika
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const accessToken = getCookie('access_token');
      if (accessToken) {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsLoggedIn(true);
        } else {
          console.warn('[AuthProvider fetchInitialData] Token found, but user data invalid/expired. Clearing auth.');
          clearAuthCookies();
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        clearAuthCookies();
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('[AuthProvider fetchInitialData] Error fetching initial user data:', error);
      clearAuthCookies();
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
      // console.log('[AuthProvider fetchInitialData] Initial data fetch completed. User:', user?.email, 'LoggedIn:', isLoggedIn);
    }
  }, []); // Ta funkcja nie zależy od `user` ani `isLoggedIn`, bo sama je ustawia. Usunąłem je z zależności.

  // --- WAŻNA ZMIANA KOLEJNOŚCI: refresh ZAWSZE PRZED login, JEŚLI login GO UŻYWA ---
  // Funkcja wylogowania użytkownika (refresh zależy od logout, więc logout musi być wcześniej)
  const logout = useCallback(async () => {
    try {
      await logoutUser();
      clearAuthCookies();
      setUser(null);
      setIsLoggedIn(false);
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  // Funkcja odświeżania tokena (login zależy od refresh, więc refresh musi być wcześniej)
  const refresh = useCallback(async () => {
    try {
      const response = await refreshToken();
      if (response && response.access) {
        console.log("Token refresh successful. Fetching current user.");
        await fetchInitialData(); // fetchInitialData obsłuży ustawienie usera i isLoggedIn
      } else {
        console.warn("Token refresh failed or no new access token. Logging out.");
        await logout();
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      console.log("Token refresh error, logging out.");
      await logout();
    }
  }, [logout, fetchInitialData]); // Zależności: logout i fetchInitialData.

  // Funkcja logowania użytkownika
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const loginResponse = await loginUser(email, password);
      await fetchInitialData(); // Po zalogowaniu odśwież stan użytkownika

      // Ustaw interwał odświeżania tokena tylko jeśli nie jest aktywny
      if (!intervalId.current) {
          intervalId.current = setInterval(() => {
              console.log('AuthContext: Interval tick (after login).');
              refresh();
          }, 4 * 60 * 1000);
      }
      
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  }, [router, fetchInitialData, refresh]); // refresh jest teraz zdefiniowany

  // Główny efekt do inicjalizacji danych i konfiguracji interwału
  useEffect(() => {
    fetchInitialData();

    if (!intervalId.current) {
        intervalId.current = setInterval(() => {
            console.log('AuthContext: Interval tick.');
            refresh();
        }, 4 * 60 * 1000);
    }

    return () => {
      console.log('AuthProvider unmounted. Clearing interval.');
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [fetchInitialData, refresh]);

  // Efekt do proaktywnego czyszczenia ciasteczek na stronie logowania
  useEffect(() => {
    if (pathname === '/login') {
      const hasAuthCookies = getCookie('access_token') || getCookie('refresh_token');
      if (hasAuthCookies && !isLoggedIn && !isLoading) {
        console.log('[AuthContext - Login Page Effect] Znaleziono ciasteczka autoryzacji na stronie logowania bez aktywnej sesji. Proaktywne czyszczenie.');
        clearAuthCookies();
        fetchInitialData();
      }
    }
  }, [pathname, isLoggedIn, isLoading, fetchInitialData]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);