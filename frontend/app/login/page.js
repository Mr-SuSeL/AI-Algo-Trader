"use client"
import React, { useState, useContext } from 'react'
// import { loginUser } from '@/utils/auth'; 
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/store/AuthContext'; // Importuj obiekt kontekstu

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [toast, setToast] = useState(null);
    const router = useRouter();

    // DO POBRANIA FUNKCJI LOGIN I STANU Z KONTEKSTU
    const authContext = useContext(AuthContext);

    // Sprawdzenie, czy kontekst jest dostępny
     if (authContext === undefined) {
        throw new Error('LoginPage must be used within an AuthProvider');
     }

    // Pobieramy funkcję 'login' i status 'isLoading' z obiektu kontekstu
    const { login, isLoggedIn, isLoading } = authContext;

    // Przekieruj, jeśli użytkownik jest już zalogowany (np. wrócili na stronę logowania)
    if (isLoggedIn && !isLoading) {
         router.push('/'); // Przekieruj na stronę główną
         return null; // Nie renderuj nic, dopóki nie nastąpi przekierowanie
    }

    // Funkcja do pokazywania toastów
    const showToast = (message, type) => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 5000) // Autoukrywanie po 5 sekundach
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (email === "" || password === "") {
            showToast("Please fill in all fields", "error")
            return
        }
        
        try {
            // Z KONTEKSTU AUTORYZACJI
            // Ta funkcja wywoła API (loginUser) i zaktualizuje stan w Providerze
            await login(email, password);

            // Jeśli linia powyżej zakończy się sukcesem (nie rzuci błędu),
            // login() w Context Providerze już ustawił isLoggedIn=true i user
            showToast("User logged in successfully!", "success");
            router.push('/'); // Przekierowanie po udanym logowaniu

        } catch (e) {
             // Błąd złapany z funkcji login w Context Providerze
            showToast(`Login failed: ${e.message || 'Unknown error'}`, "error"); 
        }
    };

 return (
        <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md shadow-lg ${
                    toast.type === "success"
                        ? "bg-green-500 text-white"
                        : "bg-red-100 text-red-800 border border-red-300"
                }`}>
                    <div className="flex items-center justify-between">
                        <span>{toast.message}</span>
                        <button
                            onClick={() => setToast(null)}
                            className="ml-4 text-current hover:text-gray-700"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-gray-300 p-8 flex flex-col rounded-lg w-full max-w-md shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log in</h2>
                <label className="text-gray-800 mb-1 font-medium">Email</label>
                <input
                    className="bg-gray-200 text-gray-800 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label className="text-gray-800 mb-1 font-medium">Password</label>
                <input
                    className="bg-gray-200 text-gray-800 p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className={`bg-blue-600 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded transition-colors cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="submit"
                    disabled={isLoading} // Zablokuj przycisk podczas ładowania
                >
                    {isLoading ? 'Logging In...' : 'Login'} {/* Zmień tekst przycisku podczas ładowania */}
                </button>
            </form>
        </div>
    );
}