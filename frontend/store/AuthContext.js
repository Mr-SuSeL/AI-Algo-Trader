// frontend/store/AuthContext.js

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
    const [csrfToken, setCsrfToken] = useState(null);
    const [isSessionExpired, setIsSessionExpired] = useState(false); // Nowy stan

    const router = useRouter();

    const fetchInitialData = async () => {
        try {
            await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
            const initialCsrf = getCookie('csrftoken');
            if (initialCsrf) {
                setCsrfToken(initialCsrf);
                console.log("Initial CSRF token obtained and set in state:", initialCsrf);
            } else {
                console.warn("CSRF token not found after initial fetch.");
                setIsLoading(false);
                return;
            }
            try {
                const userData = await getUserInfo();
                setUser(userData.user);
                setIsLoggedIn(true);
                console.log("User info fetched successfully:", userData.user);
            } catch (authError) {
                console.warn("User info fetch failed (expected if not logged in yet):", authError.message);
            }
        } catch (error) {
            console.error("Auth check failed during initial data fetch:", error);
            setIsLoggedIn(false);
            setUser(null);
            setCsrfToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            let currentCsrf = csrfToken;
            if (!currentCsrf) {
                await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
                currentCsrf = getCookie('csrftoken');
                if (!currentCsrf) throw new Error("CSRF token missing for login.");
                setCsrfToken(currentCsrf);
            }
            const responseData = await loginUser(email, password, currentCsrf);
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
            let currentCsrf = csrfToken;
            if (!currentCsrf) {
                await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
                currentCsrf = getCookie('csrftoken');
                if (currentCsrf) setCsrfToken(currentCsrf);
            }
            const response = await logoutUser(currentCsrf);
            setUser(null);
            setIsLoggedIn(false);
            setCsrfToken(null);
            console.log("Backend logout API call successful (status:", response?.status, ').');
            deleteAuthCookies();
            console.log('Frontend: Relevant cookies explicitly deleted after logout.');
            router.push('/login');
        } catch (error) {
            console.error("Logout failed in AuthContext:", error);
            setUser(null);
            setIsLoggedIn(false);
            setCsrfToken(null);
        }
    };

    const refresh = async () => {
        try {
            let currentCsrf = csrfToken;
            if (!currentCsrf) {
                await axios.get(`http://localhost:8000/api/users/csrf-token/`, { withCredentials: true });
                currentCsrf = getCookie('csrftoken');
                if (!currentCsrf) throw new Error("CSRF token missing for refresh.");
                setCsrfToken(currentCsrf);
            }
            await refreshToken(currentCsrf);
            await fetchInitialData();
            console.log("Token refreshed successfully.");
        } catch (error) {
            console.error("Token refresh failed in AuthContext:", error);
            deleteAuthCookies();
            setUser(null);
            setIsLoggedIn(false);
            setIsSessionExpired(true);
            console.log("AuthContext: Session expired flag set to true."); // Dodany log
        }
    };

    useEffect(() => {
        console.log("AuthProvider mounted. Fetching initial data...");
        fetchInitialData();

        const intervalId = setInterval(() => {
            console.log("AuthContext: Interval tick."); // Dodany log wewnątrz interwału
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
        csrfToken,
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