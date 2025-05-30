"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, refreshToken, getUserInfo, getCookie, deleteAuthCookies } from '@/utils/auth';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const router = useRouter();

    useEffect(() => {
        console.log("[AuthProvider - useEffect - top level] document.cookie:", document.cookie); // Przeniesione logowanie
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const accessToken = getCookie('access_token');
            if (accessToken) {
                try {
                    const userData = await getUserInfo(accessToken);
                    if (userData?.user) {
                        setUser(userData.user);
                        setIsLoggedIn(true);
                        console.log("User info fetched successfully:", userData.user);
                    } else {
                        setUser(null);
                        setIsLoggedIn(false);
                        console.log("No user data on initial fetch (but access token was present).");
                    }
                } catch (authError) {
                    console.warn("User info fetch failed on initial load (access token present):", authError.message);
                    setUser(null);
                    // Nie ustawiamy od razu isLoggedIn na false. Pozwalamy interwałowi spróbować odświeżyć.
                }
            } else {
                setUser(null);
                setIsLoggedIn(false);
                console.log("No access token on initial fetch.");
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
            await logoutUser();
            console.log("Backend logout API call initiated.");
        } catch (error) {
            console.error("Logout API call failed:", error);
        } finally {
            deleteAuthCookies();
            setUser(null);
            setIsLoggedIn(false);
            console.log('Frontend: Relevant cookies deleted after logout.');
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
                await fetchInitialData(); // Fallback
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
            const accessToken = getCookie('access_token');
            if (!accessToken) {
                console.warn("fetchUserInfoAfterRefresh: No access token found in cookies.");
                return;
            }
            const userData = await getUserInfo(accessToken);
            setUser(userData.user);
            setIsLoggedIn(true);
            console.log("User info fetched after refresh:", userData.user);
        } catch (authError) {
            console.warn("Failed to fetch user info after refresh:", authError.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("AuthProvider mounted. Setting timeout for initial data fetch...");
        const timeoutId = setTimeout(() => {
            console.log("Timeout expired. Fetching initial data...");
            console.log("[AuthProvider useEffect] document.cookie:", document.cookie);
            fetchInitialData();
        }, 0);

        const intervalId = setInterval(() => {
            console.log("AuthContext: Interval tick.");
            refresh();
        }, 120000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
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