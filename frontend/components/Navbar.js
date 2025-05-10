"use client"; // Ten komponent musi być Client Component

import React, { useContext } from 'react';
//import React, { useState } from 'react'; // Potrzebne np. do zarządzania stanem logowania, choć lepszy globalny (Context/Redux/itp.)
import Link from 'next/link'; // Komponent do nawigacji po stronach w Next.js
import { AuthContext } from '@/store/AuthContext'; // Importuj obiekt kontekstu
//import { logoutUser, refreshToken } from '@/utils/auth'; // Funkcje do zarządzania autoryzacją

function Navbar() {
  // useContext DO POBRANIA STANU I FUNKCJI Z KONTEKSTU
  const authContext = useContext(AuthContext);

   // Sprawdzenie, czy kontekst jest dostępny
    if (authContext === undefined) {
        throw new Error('Navbar must be used within an AuthProvider');
    }

   // Pobieramy potrzebne dane i funkcje z obiektu kontekstu
  const { isLoggedIn, user, logout, refreshToken, isLoading } = authContext;


  // Funkcje handle teraz po prostu wywołują funkcje POBRANE Z KONTEKSTU
  const handleLogout = async () => {
    try {
        await logout(); // <-- Wywołaj funkcję logout Z KONTEKSTU
        // Context Provider już zaktualizował stan isLoggedIn i user po sukcesie/porażce API
    } catch (error) {
         console.error("Logout failed:", error);
         // Obsługa błędu (np. wyświetlenie komunikatu o błędzie wylogowania API)
    }
  };

  const handleRefresh = async () => {
    try {
         await refreshToken(); // <-- Wywołaj funkcję refreshToken Z KONTEKSTU
         // Context Provider zaktualizował stan po sukcesie/porażce API odświeżenia
         alert("Token odświeżony!"); // Prosty komunikat o sukcesie
    } catch (error) {
        console.error("Refresh failed:", error);
        // Obsługa błędu (Context Provider już ustawił isLoggedIn=false jeśli odświeżenie nieudane)
        alert("Nie udało się odświeżyć tokenu. Zaloguj się ponownie."); // Prosty komunikat o błędzie
    }
  };


  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">

        {/* Lewa strona: Logo/Nazwa aplikacji */}
        <div className="text-lg font-bold">
          <Link href="/" className="hover:text-gray-300">
            AI Algo Trader
          </Link>
        </div>

        {/* Prawa strona: Kontener na przyciski */}
        <div className="flex items-center space-x-4">

           {/* Opcjonalnie: Pokaż stan ładowania Contextu */}
           {isLoading && <span className="text-gray-500">Ładowanie...</span>}

           {/* Opcjonalnie: Pokaż powitanie użytkownika jeśli zalogowany i dane użytkownika są dostępne */}
           {isLoggedIn && user && <span className="text-gray-300">Witaj, {user.email || user.username || 'Użytkowniku'}!</span>}


          {/* Warunkowe renderowanie przycisków w zależności od stanu logowania */}
          {isLoggedIn ? (
            // --------------- PRZYCISKI WIDOCZNE, GDY UŻYTKOWNIK JEST ZALOGOWANY ---------------
            <>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                 disabled={isLoading} // Zablokuj przyciski w Navarze gdy Context ładuje
              >
                Log out
              </button>

              <button
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                 disabled={isLoading} // Zablokuj przyciski w Navarze gdy Context ładuje
              >
                Stay logged in
              </button>
            </>
          ) : (
            // --------------- PRZYCISKI WIDOCZNE, GDY UŻYTKOWNIK NIE JEST ZALOGOWANY ---------------
            <>
              <Link
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                 // Linki nie blokujemy w zależności od isLoading Contextu, bo one po prostu nawigują
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                 // Linki nie blokujemy w zależności od isLoading Contextu
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