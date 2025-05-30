// frontend/app/blog/[slug]/ArticleDetailClient.js
"use client";

import React, { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/store/AuthContext';

function ArticleDetailClient({ article }) {
    const { user, isLoggedIn, isLoading } = useContext(AuthContext);
    const isAdminOrStaff = isLoggedIn && (user?.is_superuser || user?.is_staff);
    const isAuthor = isLoggedIn && user?.id === article?.author?.id;

    console.log("Article prop in ArticleDetailClient:", article);
    console.log("Current user in ArticleDetailClient:", user);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">{article?.title}</h1>
            <p className="text-gray-800 text-lg mb-4">{article?.content}</p>
            <p className="text-sm text-gray-500">Author: {article?.author?.nickname || article?.author?.username || 'Unknown'}</p>
            <p className="text-sm text-gray-500">Published: {article?.published ? new Date(article.published).toLocaleDateString() : 'N/A'}</p>

            <div className="mt-6 flex justify-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="inline-block text-gray-800 ring ring-gray-200 opacity-70 rounded py-2 px-4 hover:bg-gray-100 hover:text-gray-900 hover:ring-gray-300 hover:font-semibold text-sm"
                >
                    Back
                </button>
                {isLoggedIn && isAdminOrStaff && isAuthor && (
                    <>
                        <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                            Edit
                        </button>
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ArticleDetailClient;