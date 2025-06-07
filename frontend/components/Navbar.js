// C:\AI-Algo-Trader\frontend\components\Navbar.js
'use client'; // This component must be a Client Component

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../store/AuthContext'; // <-- Zmieniono import na useAuth (upewnij się, że ścieżka jest poprawna, zakładam '../store/AuthContext')

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Używamy useAuth hooka do pobierania wartości kontekstu
    const { user, logout, loading } = useAuth(); // <-- Zmieniono na 'loading'

    // Zmieniono logikę isLoggedIn na bezpośrednie sprawdzenie 'user'
    const isLoggedIn = !!user; // Użytkownik jest zalogowany, jeśli obiekt 'user' istnieje
    const isAdminOrStaff = isLoggedIn && (user?.is_superuser || user?.is_staff);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-gray-800 text-gray-100 p-4 shadow-md dark:bg-gray-900 dark:text-gray-700">
            <nav className="container mx-auto flex justify-between items-center">
                <div className="text-lg md:text-base lg:text-lg font-bold">
                    <Link href="/" className="text-gray-100 hover:text-blue-400 dark:text-gray-700 dark:hover:text-blue-400">
                        AI Algo Trader
                    </Link>
                </div>

                <div className="hidden md:flex space-x-4">
                    <Link href="#" className="text-gray-100 ring ring-gray-600 rounded py-2 px-8 md:py-1 md:px-4 lg:py-2 lg:px-8 hover:bg-gray-700 hover:text-white hover:ring-gray-700 hover:font-bold md:text-sm lg:text-base
                                             dark:text-gray-700 dark:ring-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:hover:ring-gray-800">Link1</Link>
                    <Link href="/chat" className="text-gray-100 ring ring-gray-600 rounded py-2 px-8 md:py-1 md:px-4 lg:py-2 lg:px-8 hover:bg-gray-700 hover:text-white hover:ring-gray-700 hover:font-bold md:text-sm lg:text-base
                                             dark:text-gray-700 dark:ring-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:hover:ring-gray-800">Chat</Link>
                    {isAdminOrStaff && (
                        <Link href="/blog/add" className="text-gray-100 ring ring-gray-600 rounded py-2 px-8 md:py-1 md:px-4 lg:py-2 lg:px-8 hover:bg-gray-700 hover:text-white hover:ring-gray-700 hover:font-bold md:text-sm lg:text-base
                                                     dark:text-gray-700 dark:ring-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:hover:ring-gray-800">Add Article</Link>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="focus:outline-none">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.828 4.829z"/>
                                ) : (
                                    <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
                                )}
                            </svg>
                        </button>
                    </div>

                    {loading && <span className="text-gray-300 hidden md:inline md:text-sm lg:text-base dark:text-gray-400">Loading...</span>}
                    {isLoggedIn && user ? (
                        <span className="text-gray-200 hidden md:inline md:text-sm lg:text-base dark:text-gray-300">
                            Welcome, {user.nickname || user.username || user.email}!
                        </span>
                    ) : null}

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 md:py-1 md:px-2 lg:py-2 lg:px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hidden md:inline md:text-sm lg:text-base
                                             dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                            disabled={loading}
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 md:py-1 md:px-2 lg:py-2 lg:px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hidden md:inline md:text-sm lg:text-base
                                                     dark:bg-green-700 dark:hover:bg-green-600 dark:text-white"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 md:py-1 md:px-2 lg:py-2 lg:px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hidden md:inline md:text-sm lg:text-base
                                                     dark:bg-yellow-700 dark:hover:bg-yellow-600 dark:text-white"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <div className={`md:hidden fixed top-0 left-0 w-full h-full bg-gray-800 z-50 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                                 dark:bg-gray-900`}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <button onClick={toggleMenu} className="focus:outline-none">
                            <svg className="w-6 h-6 fill-current text-gray-100 dark:text-gray-700" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.828 4.829z"/>
                            </svg>
                        </button>
                    </div>
                    <Link href="#" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 rounded text-center ring ring-gray-600 text-gray-100 mb-2 hover:bg-gray-700 hover:text-white hover:ring-gray-700
                                             dark:ring-gray-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:hover:ring-gray-800">Link1</Link>
                    <Link href="/chat" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 rounded text-center ring ring-gray-600 text-gray-100 mb-2 hover:bg-gray-700 hover:text-white hover:ring-gray-700
                                             dark:ring-gray-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:hover:ring-gray-800">Chat</Link>
                    {isAdminOrStaff && (
                        <Link href="/blog/add" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 rounded text-center ring ring-gray-600 text-gray-100 mb-2 hover:bg-gray-700 hover:text-white hover:ring-gray-700
                                                             dark:ring-gray-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:hover:ring-gray-800">Add Article</Link>
                    )}
                    {loading && <span className="text-gray-300 block py-2 text-center md:text-sm dark:text-gray-400">Loading...</span>}
                    {isLoggedIn && user ? (
                        <span className="text-gray-200 block py-2 text-center md:text-sm dark:text-gray-300">
                            Welcome, {user.nickname || user.username || user.email}!
                        </span>
                    ) : null}
                    {isLoggedIn ? (
                        <div className="text-center">
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 my-4 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full text-center md:text-sm
                                                     dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                                disabled={loading}
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mb-2">
                                <Link
                                    href="/login"
                                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full md:text-sm
                                                         dark:bg-green-700 dark:hover:bg-green-600 dark:text-white"
                                >
                                    Log in
                                </Link>
                            </div>
                            <div>
                                <Link
                                    href="/register"
                                    className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full md:text-sm
                                                         dark:bg-yellow-700 dark:hover:bg-yellow-600 dark:text-white"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
