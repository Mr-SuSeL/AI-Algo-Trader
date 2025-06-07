// C:\AI-Algo-Trader\frontend\utils\auth.js
import axios from "axios";

// Upewnij się, że api jest poprawnie zaimportowane z withCredentials: true
// Jeśli nie masz pliku api.js, możesz usunąć ten import i użyć bezpośrednio axios z withCredentials: true
const API_BASE_URL = "http://localhost:8000/api"; // Upewnij się, że to jest poprawny adres URL Twojego API Django

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // WAŻNE: To sprawia, że ciasteczka są wysyłane z żądaniami CORS
  headers: {
    "Content-Type": "application/json",
  },
});


// --- Funkcja pomocnicza do pobierania ciasteczka ---
export const getCookie = (name) => {
    if (typeof document === 'undefined') {
        console.log(`[getCookie] Running in non-browser environment. Returning null for ${name}.`);
        return null;
    }
    console.log(`[getCookie] Looking for cookie: "${name}"`);
    console.log(`[getCookie] All cookies: "${document.cookie}"`); // Dodane logowanie wszystkich ciasteczek
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
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

// --- NOWA FUNKCJA clearAuthCookies (Zastępuje deleteCookie i deleteAuthCookies) ---
export function clearAuthCookies() {
    console.log('[clearAuthCookies] Rozpoczynam usuwanie ciasteczek autoryzacji.');
    const cookiesToClear = ['access_token', 'refresh_token', 'csrftoken']; // Dodano csrftoken dla pewności
    const domainsToClear = [window.location.hostname, '']; // 'localhost' i pusty string dla domyślnego
    const pathsToClear = ['/', window.location.pathname, '/api', '/api/users', '/api/users/login']; // Często używane ścieżki
    const secureOptions = [false, true]; // Spróbuj bez secure i z secure
    const samesiteOptions = ['Lax', 'Strict', 'None'];

    cookiesToClear.forEach(name => {
        domainsToClear.forEach(domain => {
            pathsToClear.forEach(path => {
                secureOptions.forEach(secure => {
                    samesiteOptions.forEach(samesite => {
                        let cookieString = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                        if (domain) {
                            cookieString += ` domain=${domain};`;
                        }
                        if (secure) {
                            cookieString += ` secure;`;
                        }
                        if (samesite) {
                            cookieString += ` samesite=${samesite};`;
                        }
                        document.cookie = cookieString;
                    });
                });
            });
        });
    });
    console.log('[clearAuthCookies] Zakończono próbę usunięcia ciasteczek.');
    console.log('[clearAuthCookies] Stan ciasteczek po próbie czyszczenia:', document.cookie);
}


// --- ZMODYFIKOWANE FUNKCJE (Używają nowej logiki clearAuthCookies) ---
export const registerUser = async (email, username, password) => {
    try {
        const response = await api.post(`/users/register/`, { email, username, password }); // Używam 'api'
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (registerUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Registration failed!");
    }
}

export const loginUser = async (email, password) => {
    try {
        console.log("[loginUser] Starting login process.");
        const response = await api.post(`/users/login/`, { email, password }); // Używam 'api'
        console.log("[loginUser] Login API call successful. Returning data.");
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (loginUser):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Login failed!");
    }
}

export const logoutUser = async () => {
    try {
        // Backend powinien usunąć refresh token z listy zblacklistowanych (jeśli jest taka logika)
        // Jeśli nie, to i tak frontend usunie ciasteczka
        const response = await api.post(`/users/logout/`, null); // Używam 'api'
        console.log("Backend logout API call successful (status:", response.status, ").");
        // clearAuthCookies(); // To wywołanie przenosimy do AuthContext.js dla centralizacji

        console.log("Frontend: Backendowa część wylogowania zakończona.");
        return response.data;
    } catch (e) {
        console.error("Szczegóły błędu w utils/auth.js (logoutUser):", e.response?.data || e.message || e);
        // clearAuthCookies(); // To wywołanie przenosimy do AuthContext.js dla centralizacji
        console.warn("Frontend: Błąd API wylogowania. Przekazuję dalej.");

        if (axios.isAxiosError(e) && e.response && e.response.status >= 200 && e.response.status < 300) {
            console.warn("Logout API zwróciło sukces (2xx), ale Axios zgłosił błąd. To niezwykłe.");
            return e.response.data || { success: true };
        }
        throw new Error(e.response?.data?.detail || "Logout failed!");
    }
}

// Funkcja do pobierania danych aktualnie zalogowanego użytkownika
export const fetchCurrentUser = async () => {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
        console.log("No access token on initial fetch.");
        return null; // Brak tokena dostępu, użytkownik nie jest zalogowany
    }

    try {
        // Zmieniono endpoint z /users/me/ na /users/user-info/
        const response = await api.get(`/users/user-info/`, { 
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log("User info fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Błąd w utils/auth.js (fetchCurrentUser):", error.response?.data || error.message);
        // Jeśli token dostępu jest nieprawidłowy/wygasły, spróbuj odświeżyć
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log("Access token nieprawidłowy/wygasły. Próbuję odświeżyć token.");
            try {
                await refreshToken(); // Spróbuj odświeżyć token
                // Po udanym odświeżeniu, tokeny w ciasteczkach będą aktualne.
                // Spróbuj pobrać użytkownika ponownie (z nowymi tokenami)
                const refreshedUser = await fetchCurrentUser();
                return refreshedUser;
            } catch (refreshError) {
                console.error("Nie udało się odświeżyć tokena:", refreshError);
                // clearAuthCookies(); // Czyszczenie przeniesione do AuthContext.js
                return null;
            }
        }
        // clearAuthCookies(); // Czyszczenie przeniesione do AuthContext.js
        return null;
    }
}

export const refreshToken = async () => {
    const currentRefreshToken = getCookie('refresh_token');
    if (!currentRefreshToken) {
        console.error("Refresh token not provided (brak w ciasteczku)");
        throw new Error('Refresh token not provided');
    }

    try {
        const response = await api.post(`/users/refresh/`, { refresh: currentRefreshToken }); // Używam 'api'
        return response.data;
    } catch (e) {
        console.warn("Szczegóły błędu w utils/auth.js (refreshToken):", e.response?.data || e.message || e);
        throw new Error(e.response?.data?.detail || "Refreshing token failed!");
    }
}
