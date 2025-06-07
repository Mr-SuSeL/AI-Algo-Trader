// C:\AI-Algo-Trader\frontend\utils\auth.js
import axios from "axios";
import Cookies from 'js-cookie'; // Importuj js-cookie (musisz je zainstalować: npm install js-cookie)

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// --- Funkcja pomocnicza do pobierania ciasteczka (teraz używa js-cookie) ---
export const getCookie = (name) => {
    // js-cookie automatycznie obsługuje środowiska przeglądarkowe/nieprzeglądarkowe
    const cookieValue = Cookies.get(name);
    // console.log(`[getCookie] Looking for cookie: "${name}". Value: "${cookieValue}"`);
    return cookieValue;
};

// --- NOWA UPROSZCZONA FUNKCJA clearAuthCookies (Używa js-cookie) ---
export function clearAuthCookies() {
    console.log('[clearAuthCookies] Rozpoczynam usuwanie ciasteczek autoryzacji.');
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    Cookies.remove('csrftoken', { path: '/' }); // Usuń również CSRF token jeśli go używasz
    console.log('[clearAuthCookies] Zakończono usuwanie ciasteczek.');
    // console.log('[clearAuthCookies] Stan ciasteczek po próbie czyszczenia:', document.cookie); // Możesz odkomentować do debugowania
}

// --- ZMODYFIKOWANE FUNKCJE (Używają nowej logiki clearAuthCookies i poprawek) ---

export const registerUser = async (email, username, password) => {
    try {
        const response = await api.post(`/users/register/`, { email, username, password });
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (registerUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Registration failed!");
    }
}

export const loginUser = async (email, password) => {
    try {
        console.log("[loginUser] Starting login process.");
        const response = await api.post(`/users/login/`, { email, password });
        console.log("[loginUser] Login API call successful. Returning data.");
        // WAŻNE: Backend powinien ustawiać ciasteczka access_token i refresh_token po udanym logowaniu.
        // Jeśli tak nie jest, musisz to zrobić tutaj, np. Cookies.set('access_token', response.data.access);
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (loginUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Login failed!");
    }
}

export const logoutUser = async () => {
    try {
        const response = await api.post(`/users/logout/`, null);
        console.log("Backend logout API call successful (status:", response.status, ").");
        // clearAuthCookies(); // To wywołanie jest centralizowane w AuthContext.js
        console.log("Frontend: Backendowa część wylogowania zakończona.");
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (logoutUser):", e.response?.data || e.message || e);
        console.warn("Frontend: Błąd API wylogowania. Przekazuję dalej.");
        if (axios.isAxiosError(e) && e.response && e.response.status >= 200 && e.response.status < 300) {
            console.warn("Logout API zwróciło sukces (2xx), ale Axios zgłosił błąd. To niezwykłe.");
            return e.response.data || { success: true };
        }
        throw new Error(e.response?.data?.detail || "Logout failed!");
    }
}

export const fetchCurrentUser = async () => {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
        console.log("No access token on initial fetch.");
        return null; // Brak tokena dostępu, użytkownik nie jest zalogowany
    }

    try {
        const response = await api.get(`/users/user-info/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log("User info fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Błąd w utils/auth.js (fetchCurrentUser):", error.response?.data || error.message);
        // Ważne: NIE próbujemy tutaj odświeżać tokena rekurencyjnie!
        // To jest odpowiedzialność AuthContext, aby podjąć decyzję o odświeżeniu
        // lub wylogowaniu po nieudanym fetchCurrentUser.
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log("Access token nieprawidłowy/wygasły. fetchCurrentUser zwraca null.");
            // throw new Error("Token expired or invalid"); // Możesz rzucić błąd, jeśli AuthContext ma go obsłużyć
        }
        return null; // Zwróć null, aby AuthContext mógł podjąć decyzję.
    }
}

export const refreshToken = async () => {
    const currentRefreshToken = getCookie('refresh_token');
    if (!currentRefreshToken) {
        console.error("Refresh token not provided (brak w ciasteczku)");
        throw new Error('Refresh token not provided');
    }

    try {
        const response = await api.post(`/users/refresh/`, { refresh: currentRefreshToken });
        // WAŻNE: Backend powinien ustawiać nowe ciasteczka access_token i refresh_token po udanym odświeżeniu.
        // Jeśli tak nie jest, musisz to zrobić tutaj, np. Cookies.set('access_token', response.data.access);
        return response.data;
    } catch (e) {
        console.warn("Szczegóły błędu w utils/auth.js (refreshToken):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Refreshing token failed!");
    }
}