// C:\AI-Algo-Trader\frontend\app\page.js
'use client'; // Ważne dla użycia hooków Reacta

import React from 'react';
import Navbar from '../components/Navbar';
import Blog from '../components/Blog';
import HeroSection from '../components/HeroSection';
import { useAuth } from '../store/AuthContext'; // <-- Zmieniono import na useAuth
import Footer from '../components/Footer';

export default function Home() {
    // Używamy useAuth hooka, aby uzyskać dostęp do stanu uwierzytelnienia
    const { user, loading } = useAuth(); // <-- Zmieniono na 'loading'

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Navbar />
                <div className="m-10">
                    <h1>Ładowanie autoryzacji...</h1>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <HeroSection />
            <div>
                <Blog />
            </div>
            <Footer />
        </div>
    );
}
