"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, refreshToken, getUserInfo, getCookie, deleteAuthCookies } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const router = useRouter();

    const fetchInitialData = async () => {
            setIsLoading(true); // Dodaj to na początku
            try {
                const accessToken = getCookie('access_token');
                try {
                    const userData = await getUserInfo(accessToken);
                    if (userData.user) {
                        setUser(userData.user);
                        setIsLoggedIn(true);
                        console.log("User info fetched successfully:", userData.user);
                    } else {
                        setUser(null);
                        setIsLoggedIn(false);
                        console.log("No user data on initial fetch.");
                    }
                } catch (authError) {
                    console.warn("User info fetch failed (expected if not logged in yet):", authError.message);
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Auth check failed during initial data fetch:", error);
                setIsLoggedIn(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

    const login = async (email, password) => {
        try {
            const responseData = await loginUser(email, password);
            setUser(responseData.user);
            setIsLoggedIn(true);
            console.log("Login successful, user set:", responseData.user);
            setTimeout(() => router.push('/'), 0);
        } catch (error) {
            console.error("Login failed in AuthContext:", error);
            setUser(null);
            setIsLoggedIn(false);
            throw error;
        }
    };

    const logout = async () => {
            try {
                // Spróbuj wylogować się na backendzie. Jeśli refresh_token jest obecny, zostanie użyty.
                const response = await logoutUser();
                console.log("Backend logout API call successful (status:", response?.status, ').');
            } catch (error) {
                console.error("Logout API call failed:", error);
                // Nie traktujemy błędu wylogowania backendu jako krytycznego dla wylogowania frontendowego.
                // Nawet jeśli się nie uda, wyczyścimy ciasteczka lokalnie.
            } finally {
                deleteAuthCookies();
                setUser(null);
                setIsLoggedIn(false);
                console.log('Frontend: Relevant cookies explicitly deleted after logout.');
                router.push('/');
            }
        };

    const refresh = async () => {
        try {
            const response = await refreshToken();
            if (response?.access) {
                console.log("Token refreshed successfully:", response);
                await fetchUserInfoAfterRefresh();
            } else {
                console.warn("Token refresh successful, but no access token in response.");
                await fetchInitialData(); // Fallback, ale może nie być idealne
            }
        } catch (error) {
            console.error("Token refresh failed in AuthContext:", error);
            deleteAuthCookies();
            setUser(null);
            setIsLoggedIn(false);
            setIsSessionExpired(true);
            console.log("AuthContext: Session expired flag set to true.");
        }
    };

    const fetchUserInfoAfterRefresh = async () => {
        try {
            const accessToken = getCookie('access_token'); // Pobierz token bezpośrednio z ciasteczka
            if (!accessToken) {
                console.warn("fetchUserInfoAfterRefresh: No access token found in cookies.");
                return;
            }
            const userData = await getUserInfo(accessToken); // Przekaż token do getUserInfo
            setUser(userData.user);
            setIsLoggedIn(true);
            console.log("User info fetched after refresh:", userData.user);
        } catch (authError) {
            console.warn("Failed to fetch user info after refresh:", authError.message);
            // Możesz chcieć wylogować użytkownika tutaj, jeśli nie można pobrać info
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("AuthProvider mounted. Fetching initial data...");
        fetchInitialData();

        const intervalId = setInterval(() => {
            console.log("AuthContext: Interval tick.");
            refresh();
        }, 120000); // Co 2 minuty

        return () => clearInterval(intervalId);
    }, []);

    const contextValue = {
        user,
        isLoggedIn,
        isLoading,
        login,
        logout,
        refreshToken: refresh,
        isSessionExpired,
        resetSessionExpired: () => setIsSessionExpired(false),
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
                Ładowanie danych uwierzytelniania...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};