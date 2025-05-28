// frontend/app/blog/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link
import Pagination from '@/components/Pagination'; // Załóżmy, że stworzysz taki komponent

export default function Blog() {
    const [allArticles, setAllArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6); // Domyślnie dla desktopa

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) { // Zakładamy, że 768px to próg dla mobile
                setPostsPerPage(3);
            } else {
                setPostsPerPage(6);
            }
        };

        // Początkowe ustawienie
        handleResize();

        // Dodanie listenera na zmianę rozmiaru okna
        window.addEventListener('resize', handleResize);

        // Cleanup listenera
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:8000/api/articles/articles/');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setAllArticles(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentArticles = allArticles.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                    {currentArticles.map(article => (
                        <div key={article.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900">{article.title}</h2>
                                <p className="mt-2 text-gray-600">{article.description}</p>
                                <p className="mt-2 text-sm text-gray-500">Autor: {article.author?.nickname || article.author?.username || article.author?.email || 'Nieznany'}</p>
                                <p className="mt-1 text-sm text-gray-500">Opublikowano: {new Date(article.published).toLocaleDateString()}</p>
                                    <Link href={`/blog/${article.slug}`} prefetch={false} className="inline-block mt-4 text-indigo-600 hover:underline">
                                        Czytaj więcej
                                    </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {allArticles.length > 0 && ( // Zabezpieczenie przed renderowaniem Pagination bez danych
                    <Pagination
                        currentPage={currentPage}
                        totalPosts={allArticles.length}
                        postsPerPage={postsPerPage}
                        paginate={paginate}
                    />
                )}
            </div>
        </div>
    );
}