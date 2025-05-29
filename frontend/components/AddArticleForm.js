"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useContext } from 'react';
import { AuthContext } from '@/store/AuthContext';

const AddArticleForm = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { csrfToken } = useContext(AuthContext); // Pobierz csrfToken z kontekstu

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('http://localhost:8000/api/articles/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken, // Dodaj token CSRF do nagłówków
                },
                body: JSON.stringify({ title, content, description }),
                credentials: 'include', // Upewnij się, że ciasteczka są wysyłane
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Article added:', data);
                setSuccessMessage('Article added successfully!');
                setTitle('');
                setContent('');
                setDescription('');
                setTimeout(() => router.push('/'), 1000); // Przekieruj do strony głównej po dodaniu artykułu
            } else {
                const errorData = await response.json();
                console.error('Error adding article:', errorData);
                setError('An error occurred while adding the article.');
                // You might want to handle `errorData` more specifically
            }
        } catch (err) {
            console.error('Network error:', err);
            setError('There was a problem connecting to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-md shadow-md">
            <h2 className="text-xl text-center font-semibold mb-4">New article</h2>
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        rows="5"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add article'}
                </button>
            </form>
        </div>
    );
};

export default AddArticleForm;