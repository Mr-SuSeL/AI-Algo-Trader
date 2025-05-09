import React, { useState } from 'react'; // Potrzebne np. do zarządzania stanem logowania, choć lepszy globalny (Context/Redux/itp.)
import Link from 'next/link'; // Komponent do nawigacji po stronach w Next.js

import { logoutUser, refreshToken } from '@/utils/auth'; // Funkcje do zarządzania autoryzacją

function Navbar() {
    // Przykład prostego stanu logowania - w rzeczywistej aplikacji będziesz go pobierać z Context API, Zustand, Redux itp.
    // Ten stan będzie decydował, które przyciski są widoczne.
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const handleLogout = async () => {
        await logoutUser();
    };
        
    const handleRefresh = async () => {
    await refreshToken();
    }








   // ... (pozostała część kodu przed return() bez zmian)

   return (
    <header className="bg-gray-800 text-white p-4 shadow-md"> {/* Stylowanie nagłówka */}
        <nav className="container mx-auto flex justify-between items-center"> {/* Kontener centrujący, flexbox */}
    
    {/* Lewa strona: Logo/Nazwa aplikacji */}
    <div className="text-lg font-bold">
    <Link href="/" className="hover:text-gray-300">
        AI Algo Trader
    </Link>
    </div>
    
    {/* Prawa strona: Kontener na przyciski */}
        <div className="flex items-center space-x-4"> {/* Flexbox dla przycisków, odstępy, centrowanie w pionie */}
        
        {/* Warunkowe renderowanie przycisków w zależności od stanu logowania */}
        {isLoggedIn ? (
        // --------------- PRZYCISKI WIDOCZNE, GDY UŻYTKOWNIK JEST ZALOGOWANY ---------------
            <>
            {/* PRZYCISK Wyloguj */}
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                    >
                    Log out
                </button>
                
                {/* PRZYCISK Odśwież Token */}
                <button
                    onClick={handleRefresh}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                    >
                    Stay logged in
                </button>
            </>
        ) : (
        // --------------- PRZYCISKI WIDOCZNE, GDY UŻYTKOWNIK NIE JEST ZALOGOWANY ---------------
        <>
            {/* LINK Zaloguj - TERAZ Z POPRAWNYM UŻYCIEM LINK */}
            <Link
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                Log in
            </Link>
            
            {/* LINK Zarejestruj - TERAZ Z POPRAWNYM UŻYCIEM LINK */}
            <Link
                href="/register"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                Register
            </Link>
        </>
        )}
        </div>
        </nav>
    </header>
    );
    }
    
    export default Navbar;