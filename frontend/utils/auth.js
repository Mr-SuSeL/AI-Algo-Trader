// frontend/utils/auth.js

import axios from "axios";

const API_URL = "http://localhost:8000/api/users/"; // Upewnij się, że to jest poprawne i spójne z domeną Django

// --- Funkcja pomocnicza do pobierania ciasteczka (pozostaw ją tutaj) ---
export const getCookie = (name) => {
    if (typeof document === 'undefined') {
        console.log(`[getCookie] Running in non-browser environment. Returning null for ${name}.`); // Nowy log
        return null;
    }
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        console.log(`[getCookie] document.cookie: "${document.cookie}"`); // Nowy log
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                console.log(`[getCookie] Found cookie "${name}". Value: "${cookieValue}"`); // Nowy log
                break;
            }
        }
    }
    console.log(`[getCookie] Returning for "${name}": ${cookieValue}`); // Nowy log
    return cookieValue;
};


// --- POPRAWIONA FUNKCJA deleteCookie ---
export function deleteCookie(name, path = '/', domain = '') {
    let cookieString = `${name}=; expires=${new Date(0).toUTCString()}; path=${path};`;
    if (domain) {
        cookieString += ` domain=${domain};`;
    }
    // Zapewnij, że '127.0.0.1' jest usunięte z tej linii
    if (window.location.protocol === 'http:' && (domain === 'localhost' || domain === '')) {
        cookieString += ` secure=false;`;
    }
    document.cookie = cookieString;
    console.log(`Cookie '${name}' deleted.`);
}

// --- ZMODYFIKOWANE FUNKCJE AKCEPTUJĄCE csrfToken ---
export const registerUser = async (email, username, password, csrfToken) => { // <-- DODAJ csrfToken
    try {
        const response = await axios.post(`${API_URL}register/`, { email, username, password },
            {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrfToken // <-- UŻYJ PRZEKAZANEGO TOKENA
                }
            }
        );
        return response.data;
    }
    catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (registerUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Registration failed!");
    }
}
    
export const loginUser = async (email, password, csrfToken) => {
    try {
        console.log("[loginUser] Starting login process."); // Nowy log
        if (!csrfToken) {
            console.error("[loginUser] CSRF token not provided to loginUser. Throwing error."); // Nowy log
            throw new Error("Security error: CSRF token missing.");
        }
        console.log(`[loginUser] CSRF Token received: ${csrfToken ? 'Present' : 'Missing'}`); // Nowy log
        
        const response = await axios.post(`${API_URL}login/`, { email, password },
            {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrfToken
                }
            }
        );
        console.log("[loginUser] Login API call successful. Returning data."); // Nowy log
        return response.data;
    }
    catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (loginUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Login failed!");
    }
}
    
export const logoutUser = async (csrfToken) => { // <-- DODAJ csrfToken
    try {
        const response = await axios.post(`${API_URL}logout/`, null, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': csrfToken // <-- UŻYJ PRZEKAZANEGO TOKENA
            }
        });
        console.log("Backend logout API call successful (status:", response.status, ").");

        deleteCookie('access_token', '/', 'localhost');
        deleteCookie('refresh_token', '/', 'localhost');
        deleteCookie('sessionid', '/', 'localhost');
        deleteCookie('csrftoken', '/', 'localhost');

        console.log("Frontend: Relevant cookies explicitly deleted after logout.");
        return response.data;
    }
    catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (logoutUser):", e.response?.data || e.message || e);
        
        deleteCookie('access_token', '/', '127.0.0.1');
        deleteCookie('refresh_token', '/', '127.0.0.1');
        deleteCookie('sessionid', '/', '127.0.0.1');
        deleteCookie('csrftoken', '/', '127.0.0.1');
        console.warn("Frontend: Attempted to delete cookies despite logout API error.");
        
        if (axios.isAxiosError(e) && e.response && e.response.status >= 200 && e.response.status < 300) {
             console.warn("Logout API zwróciło sukces (2xx), ale Axios zgłosił błąd. To niezwykłe.");
             return e.response.data || { success: true };
        }
        throw new Error(e.response?.data?.detail || "Logout failed!");
    }
}

// getUserInfo nie wymaga csrfToken, bo to GET, ale można go przekazać dla spójności
export const getUserInfo = async () => {
    try {
        const response = await axios.get(`${API_URL}user-info/`, { withCredentials: true });
        return response.data;
    }
    catch (e) {
        console.warn("getUserInfo failed, but not throwing an error. This is expected if user is not logged in. Szczegóły błędu w utils/auth.js (getUserInfo):", e.response?.data || e.message || e);
        //console.error("Szczegóły błędu w utils/auth.js (getUserInfo):", e.response?.data || e.message || e);
        //throw new Error(e.response?.data?.detail || "Getting user info failed!");
        // Nie rzucamy błędem, tylko logujemy ostrzeżenie
        return null; // Możesz też zwrócić null lub undefined, aby zasygnalizować brak danych użytkownika
    }
}

export const refreshToken = async (csrfToken) => { // <-- DODAJ csrfToken
    try {
        const response = await axios.post(`${API_URL}refresh/`, null,
            {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrfToken // <-- UŻYJ PRZEKAZANEGO TOKENA
                }
            }
        );
        return response.data;
    }
    catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (refreshToken):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Refreshing token failed!");
    }
}