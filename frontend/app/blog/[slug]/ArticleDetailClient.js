// frontend/app/blog/[slug]/ArticleDetailClient.js
"use client";

import React, { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/store/AuthContext';
import AddArticleForm from '@/components/AddArticleForm';

function ArticleDetailClient({ article }) {
    const { user, isLoggedIn, isLoading } = useContext(AuthContext);
    const isAdminOrStaff = isLoggedIn && (user?.is_superuser || user?.is_staff);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">{article.title}</h1>
            <p className="text-gray-800 text-lg mb-4">{article.content}</p>
            <p className="text-sm text-gray-500">Author: {article.author?.nickname || article.author?.username}</p>
            <p className="text-sm text-gray-500">Published: {new Date(article.published).toLocaleDateString()}</p>

            <button
                onClick={() => window.history.back()}
                className="mt-6 inline-block text-gray-800 ring ring-gray-200 opacity-70 rounded py-1 px-4 hover:bg-gray-100 hover:text-gray-900 hover:ring-gray-300 hover:font-semibold text-sm"
            >
                Wróć
            </button>

            {isAdminOrStaff && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Dodaj nowy artykuł</h2>
                    <AddArticleForm />
                </div>
            )}
        </div>
    );
}

export default ArticleDetailClient;