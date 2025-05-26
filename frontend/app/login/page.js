"use client";

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoggedIn, isLoading } = useContext(AuthContext);
    const router = useRouter();
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if (isLoggedIn && !isLoading) {
            setTimeout(() => {
                router.push('/');
            }, 0);
            return undefined; // Zwracamy undefined zamiast null
        }
    }, [isLoggedIn, isLoading, router]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoginError('');
        try {
            await login(email, password);
            // Przekierowanie nastąpi w useEffect po zmianie isLoggedIn na true
        } catch (error) {
            setLoginError(error.message);
        }
    };

    if (isLoading) {
        return <div>Logowanie w toku...</div>;
    }

    // Jeśli jesteśmy tutaj, to albo nie jesteśmy zalogowani, albo isLoading jest false i useEffect jeszcze nie zadziałał
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
            <div className="bg-gray-700 p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Zaloguj się</h2>
                {loginError && <p className="text-red-500 mb-4">{loginError}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white sm:text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Hasło</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-white sm:text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Zaloguj się
                    </button>
                </form>
            </div>
        </div>
    );
}