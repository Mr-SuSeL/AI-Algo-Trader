"use client"; // Ważne dla użycia hooków Reacta

import React, { useContext } from 'react'; // <-- Zmienione: Importujemy useContext
import Navbar from '../components/Navbar';
import Blog from '../components/Blog';
import HelloUser from '../components/HelloUser';
import { AuthContext } from '../store/AuthContext'; // <-- Zmienione: Importujemy TYLKO AuthContext
import Footer from '../components/Footer'; // Importujemy komponent Footer

export default function Home() {
    // Używamy useContext, aby uzyskać dostęp do stanu uwierzytelnienia z AuthContext
    const { user, isLoggedIn, isLoading } = useContext(AuthContext);

    // Usuwamy useState i useEffect, ponieważ AuthContext już zarządza stanem user i isLoading
    // const [user, setUser] = useState(null);
    // useEffect(() => { ... });

    // Wyświetl komunikat ładowania, jeśli AuthContext jeszcze się inicjalizuje
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Navbar /> {/* Navbar może być renderowany także podczas ładowania */}
                <div className="m-10">
                    <h1>Ładowanie autoryzacji...</h1>
                </div>
            </div>
        );
    }

    return (
        <div>
            
            <Navbar />
            <HelloUser user={user} isLoggedIn={isLoggedIn} />
            <div>
                <Blog />
            </div>
            <Footer /> 
        </div>
    );
}