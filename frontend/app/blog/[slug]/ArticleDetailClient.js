"use client";

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';

function ArticleDetailClient({ article }) {
    const { user, isLoggedIn, csrfToken } = useContext(AuthContext);
    const isAuthor = isLoggedIn && user?.id === article?.author?.id;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(null);
    const router = useRouter();

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
    };

    const confirmDeleteArticle = async () => {
        if (!article?.id) {
            console.error("Article ID is missing, cannot delete.");
            setDeleteError("Could not delete article: ID is missing.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/articles/delete/${article.slug}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
            });

            if (response.ok) {
                setDeleteSuccess("Article deleted successfully.");
                setShowDeleteModal(false);
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                const errorData = await response.json();
                console.error("Error deleting article:", errorData);
                setDeleteError(`Could not delete article: ${errorData?.detail || response.statusText}`);
            }
        } catch (error) {
            console.error("Network error during delete:", error);
            setDeleteError("Network error: Could not connect to the server.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 relative">
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
                {isLoggedIn && (user?.is_superuser || isAuthor) && (
                    <>
                        <Link
                            href={`/blog/${article?.slug}/edit`}
                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleDeleteClick}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>

            {showDeleteModal && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                >
                    <div className="bg-white p-6 rounded-md shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete this article?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={handleCloseModal} className="py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={confirmDeleteArticle} className="py-2 px-4 rounded-md text-white bg-red-500 hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{deleteError}</span>
                </div>
            )}

            {deleteSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline">{deleteSuccess}</span>
                </div>
            )}
        </div>
    );
}

export default ArticleDetailClient;