// C:\AI-Algo-Trader\frontend\app\login\page.js
'use client'; // Ten komponent musi być komponentem klienckim

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext'; // Używamy aliasu '@' dla ścieżki do store
import { useRouter } from 'next/navigation'; // Poprawiony import useRouter

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, loading } = useAuth(); // Używamy useAuth hooka
  const router = useRouter(); // Używamy standardowo zaimportowanego useRouter

  useEffect(() => {
    // Jeśli użytkownik jest już zalogowany i loading się zakończył, przekieruj
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Logowanie nie powiodło się. Sprawdź swoje dane.');
    }
  };

  if (loading || user) {
    // Jeśli trwa ładowanie lub użytkownik jest już zalogowany, wyświetl komunikat ładowania/przekierowania
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-800">Ładowanie lub przekierowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Zaloguj się</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Hasło:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Zaloguj się
            </button>
            <Link href="/register" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Nie masz konta? Zarejestruj się!
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
