// frontend/app/blog/page.js
'use client';

import { useEffect, useState } from 'react';

export default function Blog() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/articles/articles/');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setArticles(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    if (loading) {
        return <div>Ładowanie artykułów...</div>;
    }

    if (error) {
        return <div>Błąd ładowania artykułów: {error}</div>;
    }

    return (
        <div className="bg-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map(article => (
                        <div key={article.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900">{article.title}</h2>
                                <p className="mt-2 text-gray-600">{article.description}</p>
                                <p className="mt-2 text-sm text-gray-500">Autor: {article.author}</p>
                                <p className="mt-1 text-sm text-gray-500">Opublikowano: {new Date(article.published).toLocaleDateString()}</p>
                                <a href={`/blog/${article.slug}`} className="inline-block mt-4 text-indigo-600 hover:underline">Czytaj więcej</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}