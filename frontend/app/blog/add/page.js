// frontend/app/blog/add/page.js
"use client";

import React, { useContext, useEffect } from 'react'; // Dodano useEffect
import { AuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import AddArticleForm from '@/components/AddArticleForm';

const AddArticlePage = () => {
    const { user, isLoggedIn, isLoading } = useContext(AuthContext);
    const router = useRouter();

    // Użyj useEffect do przekierowania
    useEffect(() => {
        // 1. Poczekaj, aż AuthContext zakończy ładowanie.
        if (isLoading) {
            return; // Nic nie rób, dopóki isLoading jest true
        }

        // 2. Jeśli ładowanie zakończone, sprawdź autoryzację i uprawnienia.
        // !isLoggedIn: użytkownik nie jest zalogowany
        // !(user?.is_superuser || user?.is_staff): użytkownik nie ma wymaganych uprawnień
        if (!isLoggedIn || !(user?.is_superuser || user?.is_staff)) {
            console.log("Access denied. Redirecting to login page.");
            router.push('/login'); // Przekieruj do strony logowania
        }
    }, [isLoading, isLoggedIn, user, router]); // Zależności dla useEffect

    // Warunkowe renderowanie na podstawie stanów:

    // Stan 1: Ładowanie danych użytkownika
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Stan 2: Brak autoryzacji lub uprawnień (po zakończeniu ładowania)
    // useEffect powyżej zajmie się przekierowaniem, ale tutaj możemy pokazać komunikat.
    if (!isLoggedIn || !(user?.is_superuser || user?.is_staff)) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                Access denied. You do not have permission to view this page. Redirecting...
            </div>
        );
    }

    // Stan 3: Użytkownik zalogowany i ma uprawnienia
    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Add new article</h1>
            <AddArticleForm />
        </div>
    );
};

export default AddArticlePage;