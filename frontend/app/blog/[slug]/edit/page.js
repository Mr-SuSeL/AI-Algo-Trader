// frontend/app/blog/[slug]/edit/page.js
"use client";

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthContext } from '@/store/AuthContext';
import Link from 'next/link';

function ArticleEditPage() {
    const { slug } = useParams();
    const router = useRouter();
    const { csrfToken, isLoggedIn, user } = useContext(AuthContext);
    const [article, setArticle] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthor = isLoggedIn && user?.id === article?.author?.id;

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/api/articles/${slug}/`);
                if (!res.ok) {
                    console.error("Failed to fetch article for editing");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setArticle(data);
                setTitle(data.title);
                setDescription(data.description);
                setContent(data.content);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching article:", error);
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug]);

    const handleUpdateArticle = async (e) => {
        e.preventDefault();
        if (!isLoggedIn || !user) {
            setError("You must be logged in to edit articles.");
            return;
        }
        if (!article?.author?.id || (user.id !== article.author.id && !user.is_superuser)) {
            setError("You do not have permission to edit this article.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`http://localhost:8000/api/articles/update/${slug}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ title, description, content }),
                credentials: 'include',
            });

            if (response.ok) {
                setSuccess("Article updated successfully!");
                setTimeout(() => {
                    router.push(`/blog/${slug}`);
                }, 1500);
            } else {
                const errorData = await response.json();
                setError(`Failed to update article: ${errorData?.detail || JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Error updating article:", error);
            setError("Network error: Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading article for editing...</div>;
    }

    if (!article) {
        return <div>Could not load article for editing.</div>;
    }

    // Dodano sprawdzenie uprawnień na stronie edycji
    if (!user?.is_superuser && !isAuthor) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Edit Article</h1>
                <p className="text-red-500">You do not have permission to edit this article.</p>
                <Link href={`/blog/${slug}`} className="inline-block mt-4 text-blue-500 hover:underline">
                    Back to Article
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Article</h1>
            <form onSubmit={handleUpdateArticle} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                    <input
                        type="text"
                        id="title"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                    <textarea
                        id="description"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
                    <textarea
                        id="content"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="16"
                        required
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <Link href={`/blog/${slug}`} className="inline-block text-gray-800 ring ring-gray-200 opacity-70 rounded py-2 px-4 hover:bg-gray-100 hover:text-gray-900 hover:ring-gray-300 hover:font-semibold text-sm">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Article'}
                    </button>
                </div>
                {error && <div className="text-red-500 mt-4">{error}</div>}
                {success && <div className="text-green-500 mt-4">{success}</div>}
            </form>
        </div>
    );
}

export default ArticleEditPage;