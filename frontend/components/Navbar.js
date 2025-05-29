"use client"; // Ten komponent musi być Client Component

import React, { useState, useContext } from 'react';
import Link from 'next/link'; // Komponent do nawigacji po stronach w Next.js
import { AuthContext } from '@/store/AuthContext'; // Importuj obiekt kontekstu

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const authContext = useContext(AuthContext);

    if (authContext === undefined) {
        throw new Error('Navbar must be used within an AuthProvider');
    }

    const { isLoggedIn, user, logout, isLoading } = authContext;
    const isAdminOrStaff = isLoggedIn && (user?.is_superuser || user?.is_staff);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false); // Zamknij menu po wylogowaniu
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
                {/* Lewa strona: Logo/Nazwa aplikacji */}
                <div className="text-lg md:text-base lg:text-lg font-bold">
                    <Link href="/" className="hover:text-gray-300">
                        AI Algo Trader
                    </Link>
                </div>

                {/* Środkowa część (widoczna na większych ekranach) */}
                <div className="hidden md:flex space-x-4">
                    <Link href="#" className="ring ring-gray-200 opacity-70 rounded py-2 px-8 md:py-1 md:px-4 lg:py-2 lg:px-8 hover:bg-gray-300 hover:text-gray-800 hover:ring-gray-300 hover:font-bold md:text-sm lg:text-base">Link1</Link>
                    <Link href="#" className="ring ring-gray-200 opacity-70 rounded py-2 px-8 md:py-1 md:px-4 lg:py-2 lg:px-8 hover:bg-gray-300 hover:text-gray-800 hover:ring-gray-300 hover:font-bold md:text-sm lg:text-base">Link 2</Link>
                    {isAdminOrStaff && (
                        <Link href="/blog/add" className="ring ring-gray-200 opacity-70 rounded py-2 px-8 md:py-1 md:px-4 lg:py-2 lg:px-8 hover:bg-gray-300 hover:text-gray-800 hover:ring-gray-300 hover:font-bold md:text-sm lg:text-base">Dodaj artykuł</Link>
                    )}
                </div>

                {/* Prawa strona: Hamburger menu (małe ekrany) i przyciski logowania/wylogowania */}
                <div className="flex items-center space-x-4">
                    {/* Hamburger menu dla małych ekranów */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="focus:outline-none">
                            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.828 4.829z"/>
                                ) : (
                                    <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Przyciski logowania/wylogowania (widoczne zawsze na większych ekranach) */}
                    {isLoading && <span className="text-gray-500 hidden md:inline md:text-sm lg:text-base">Ładowanie...</span>}
                    {isLoggedIn && user ? (
                        <span className="text-gray-300 hidden md:inline md:text-sm lg:text-base">
                            Witaj, {user.nickname || user.username || user.email}!
                        </span>
                    ) : null}

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 hover:font-bold text-white font-bold py-2 px-4 md:py-1 md:px-2 lg:py-2 lg:px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hidden md:inline md:text-sm lg:text-base"
                            disabled={isLoading}
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="bg-green-600 hover:bg-white hover:text-green-600 text-white font-bold py-2 px-4 md:py-1 md:px-2 lg:py-2 lg:px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hidden md:inline md:text-sm lg:text-base"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="bg-yellow-600 hover:bg-white hover:text-yellow-600 text-white font-bold py-2 px-4 md:py-1 md:px-2 lg:py-2 lg:px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hidden md:inline md:text-sm lg:text-base"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Menu mobilne (rozwijane z animacją) - tutaj dodajemy link */}
            <div className={`md:hidden fixed top-0 left-0 w-full h-full bg-gray-800 z-50 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <button onClick={toggleMenu} className="focus:outline-none">
                            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 0 1 1.414 1.414l-4.828 4.829z"/>
                            </svg>
                        </button>
                    </div>
                    <Link href="#" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 md:py-1 md:px-2 rounded text-center ring ring-gray-200 opacity-50 mb-2 hover:bg-gray-300 hover:text-gray-800 hover:ring-gray-300 md:text-sm">Link1</Link>
                    <Link href="#" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 md:py-1 md:px-2 rounded text-center ring ring-gray-200 opacity-50 mb-2 hover:bg-gray-300 hover:text-gray-800 hover:ring-gray-300 md:text-sm">Link2</Link>
                    {isAdminOrStaff && (
                        <Link href="/blog/add" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 md:py-1 md:px-2 rounded text-center ring ring-gray-200 opacity-50 mb-2 hover:bg-gray-300 hover:text-gray-800 hover:ring-gray-300 md:text-sm">Dodaj artykuł</Link>
                    )}
                    {isLoading && <span className="text-gray-500 block py-2 text-center md:text-sm">Ładowanie...</span>}
                    {isLoggedIn && user ? (
                        <span className="text-gray-300 block py-2 text-center md:text-sm">
                            Witaj, {user.nickname || user.username || user.email}!
                        </span>
                    ) : null}
                    {isLoggedIn ? (
                        <div className="text-center">
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 my-4 hover:bg-red-600 hover:font-bold text-white font-bold py-2 px-4 md:py-1 md:px-2 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full text-center md:text-sm"
                                disabled={isLoading}
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mb-2">
                                <Link
                                    href="/login"
                                    className="inline-block bg-green-600 hover:bg-white hover:text-green-600 text-white font-bold py-2 px-4 md:py-1 md:px-2 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full md:text-sm"
                                >
                                    Log in
                                </Link>
                            </div>
                            <div>
                                <Link
                                    href="/register"
                                    className="inline-block bg-yellow-600 hover:bg-white hover:text-yellow-600 text-white font-bold py-2 px-4 md:py-1 md:px-2 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full md:text-sm"
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