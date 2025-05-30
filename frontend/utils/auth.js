import axios from "axios";

const API_URL = "http://localhost:8000/api/users/";

// --- Funkcja pomocnicza do pobierania ciasteczka ---
export const getCookie = (name) => {
    if (typeof document === 'undefined') {
        console.log(`[getCookie] Running in non-browser environment. Returning null for ${name}.`);
        return null;
    }
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        console.log(`[getCookie] document.cookie: "${document.cookie}"`);
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                console.log(`[getCookie] Found cookie "${name}". Value: "${cookieValue}"`);
                break;
            }
        }
    }
    console.log(`[getCookie] Returning for "${name}": ${cookieValue}`);
    return cookieValue;
};

// --- POPRAWIONA FUNKCJA deleteCookie ---
export function deleteCookie(name, path = '/', domain = '') {
    let cookieString = `${name}=; expires=${new Date(0).toUTCString()}; path=${path};`;
    if (domain) {
        cookieString += ` domain=${domain};`;
    }
    if (window.location.protocol === 'http:' && (domain === 'localhost' || domain === '')) {
        cookieString += ` secure=false;`;
    }
    document.cookie = cookieString;
    console.log(`Cookie '${name}' deleted.`);
}

// --- ZMODYFIKOWANE FUNKCJE ---
export const registerUser = async (email, username, password) => {
    try {
        const response = await axios.post(`${API_URL}register/`, { email, username, password }, { withCredentials: true });
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (registerUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Registration failed!");
    }
}

export const loginUser = async (email, password) => {
    try {
        console.log("[loginUser] Starting login process.");
        const response = await axios.post(`${API_URL}login/`, { email, password }, { withCredentials: true });
        console.log("[loginUser] Login API call successful. Returning data.");
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (loginUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Login failed!");
    }
}

export const logoutUser = async () => {
    try {
        const response = await axios.post(`${API_URL}logout/`, null, { withCredentials: true });
        console.log("Backend logout API call successful (status:", response.status, ").");

        deleteCookie('access_token', '/', 'localhost');
        deleteCookie('refresh_token', '/', 'localhost');

        console.log("Frontend: Relevant cookies explicitly deleted after logout.");
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (logoutUser):", e.response?.data || e.message || e);

        deleteCookie('access_token', '/', 'localhost');
        deleteCookie('refresh_token', '/', 'localhost');
        console.warn("Frontend: Attempted to delete cookies despite logout API error.");

        if (axios.isAxiosError(e) && e.response && e.response.status >= 200 && e.response.status < 300) {
            console.warn("Logout API zwróciło sukces (2xx), ale Axios zgłosił błąd. To niezwykłe.");
            return e.response.data || { success: true };
        }
        throw new Error(e.response?.data?.detail || "Logout failed!");
    }
}

export const getUserInfo = async (accessToken) => {
    try {
        if (!accessToken) {
            console.warn("getUserInfo called without access token.");
            return { user: null };
        }
        const response = await axios.get(`${API_URL}user-info/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return {
            user: {
                ...response.data,
                is_superuser: response.data.is_superuser,
                is_staff: response.data.is_staff,
            },
        };
    } catch (e) {
        console.warn("getUserInfo failed, but not throwing an error. This is expected if user is not logged in. Szczegóły błędu w utils/auth.js (getUserInfo):", e.response?.data || e.message || e);
        return { user: null };
    }
}

export const refreshToken = async () => {
    try {
        const response = await axios.post(`${API_URL}refresh/`, null, { withCredentials: true });
        return response.data;
    } catch (e) {
        console.warn("Szczegóły błędu w utils/auth.js (refreshToken):", e.response?.data || e.message || e);
        //throw new Error(e.response?.data?.detail || "Refreshing token failed!");
    }
}

export function deleteAuthCookies() {
    document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Frontend: Relevant cookies explicitly deleted after logout.');
}