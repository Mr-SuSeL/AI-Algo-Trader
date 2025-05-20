"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, refreshToken, getUserInfo } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState(null); // <-- DODAJ STAN DLA CSRF TOKENA
    const router = useRouter();

    // Funkcja do pobierania informacji o użytkowniku i inicjalnego CSRF
    const fetchInitialData = async () => {
        try {
            if (!csrfToken) {
                // ZMIEŃ TO NA LOCALHOST
                await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
                const initialCsrf = getCookie('csrftoken');
                if (initialCsrf) {
                    setCsrfToken(initialCsrf);
                    console.log("Initial CSRF token obtained and set in state:", initialCsrf);
                } else {
                    console.warn("CSRF token not found after initial fetch.");
                }
            }

            // Następnie spróbuj pobrać info o użytkowniku
            const userData = await getUserInfo(); // getUserInfo nie potrzebuje już CSRF, bo jest w kontekście
            setUser(userData.user);
            setIsLoggedIn(true);
            console.log("User info fetched successfully:", userData.user);

        } catch (error) {
            console.error("Auth check failed. User is not logged in or CSRF issue:", error);
            setIsLoggedIn(false);
            setUser(null);
            setCsrfToken(null); // Wyczyść CSRF jeśli nie udało się uwierzytelnić
        } finally {
            setIsLoading(false);
        }
    };

    // Zmieniamy wywołania loginUser, logoutUser, refreshToken
    // Będą one teraz używać csrftoken ze stanu kontekstu

    const login = async (email, password) => {
        try {
            // Upewnij się, że csrfToken jest dostępny przed próbą logowania
            if (!csrfToken) {
                console.error("CSRF token is not available in AuthContext state.");
                throw new Error("Security error: CSRF token missing.");
            }
            const responseData = await loginUser(email, password, csrfToken); // Przekaż csrfToken
            setUser(responseData.user);
            setIsLoggedIn(true);
            console.log("Login successful, user set:", responseData.user);
            router.push('/');
        } catch (error) {
            console.error("Login failed in AuthContext:", error);
            setUser(null);
            setIsLoggedIn(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (!csrfToken) { // Również sprawdź CSRF przed wylogowaniem
                console.warn("CSRF token missing for logout, proceeding without header.");
                // Możesz tu wymusić wylogowanie bez CSRF, jeśli to krytyczne, lub rzucić błąd
            }
            await logoutUser(csrfToken); // Przekaż csrfToken
            setUser(null);
            setIsLoggedIn(false);
            setCsrfToken(null); // Wyczyść CSRF po wylogowaniu
            console.log("User logged out successfully.");
            router.push('/login'); // Przekieruj na stronę logowania
        } catch (error) {
            console.error("Logout failed in AuthContext:", error);
            // Nadal wyczyść stan frontendu, nawet jeśli backend zwrócił błąd
            setUser(null);
            setIsLoggedIn(false);
            setCsrfToken(null);
        }
    };

    const refresh = async () => {
        try {
            if (!csrfToken) { // Również sprawdź CSRF przed odświeżeniem tokena
                console.error("CSRF token missing for token refresh.");
                throw new Error("Security error: CSRF token missing for refresh.");
            }
            await refreshToken(csrfToken); // Przekaż csrfToken
            // Po odświeżeniu tokena, tokeny JWT są już w ciasteczkach
            // Możemy ponownie spróbować pobrać informacje o użytkowniku, aby zaktualizować UI
            await fetchInitialData(); // Odśwież dane użytkownika
            console.log("Token refreshed successfully.");
        } catch (error) {
            console.error("Token refresh failed in AuthContext:", error);
            setUser(null);
            setIsLoggedIn(false);
            router.push('/login'); // Jeśli odświeżenie nie powiedzie się, przekieruj na login
            throw error;
        }
    };


    useEffect(() => {
        console.log("AuthProvider mounted. Fetching initial data...");
        fetchInitialData();
    }, []); // Pusta tablica zależności - efekt uruchamia się tylko raz

    // Wartości dostarczane przez kontekst
    const contextValue = {
        user,
        isLoggedIn,
        isLoading,
        login,
        logout,
        refreshToken: refresh, // Zmień nazwę funkcji, aby uniknąć konfliktu
        csrfToken // Udostępnij CSRF token w kontekście
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Funkcja pomocnicza do pobierania ciasteczka (przenieś ją do utils/auth.js, jeśli jeszcze jej tam nie ma)
const getCookie = (name) => {
    if (typeof document === 'undefined') {
        return null;
    }
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};