// frontend/app/blog/add/page.js
"use client";

import React, { useContext } from 'react';
import { AuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import AddArticleForm from '@/components/AddArticleForm';

const AddArticlePage = () => {
    const { user, isLoggedIn, isLoading } = useContext(AuthContext);
    const router = useRouter();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn || !(user?.is_superuser || user?.is_staff)) {
        // Redirect if not logged in or no permissions
        React.useEffect(() => {
            router.push('/login'); // You can redirect wherever you want
        }, [router, isLoggedIn, user]);
        return <div>Access denied. Redirecting...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Add new article</h1>
            <AddArticleForm />
        </div>
    );
};

export default AddArticlePage;