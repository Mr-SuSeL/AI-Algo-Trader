'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link
import Pagination from '@/components/Pagination'; // Assuming you have this component

export default function Blog() {
    const [allArticles, setAllArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6); // Default for desktop

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) { // Assuming 768px is the mobile breakpoint
                setPostsPerPage(3);
            } else {
                setPostsPerPage(6);
            }
        };

        // Initial setting
        handleResize();

        // Add listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:8000/api/articles/')
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
        return <div>Loading articles...</div>;
    }

    if (error) {
        return <div>Error loading articles: {error}</div>;
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
                                <p className="mt-2 text-sm text-gray-500">Author: {article.author?.nickname || article.author?.username || article.author?.email || 'Unknown'}</p>
                                <p className="mt-1 text-sm text-gray-500">Published: {new Date(article.published).toLocaleDateString()}</p>
                                <Link
                                    href={`/blog/${article.slug}`}
                                    prefetch={false}
                                    className="inline-block mt-4 text-indigo-600 ring ring-indigo-200 opacity-70 rounded py-1 px-4 hover:bg-indigo-100 hover:text-indigo-800 hover:ring-indigo-300 hover:font-semibold text-sm"
                                >
                                    Read More
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {allArticles.length > 0 && ( // Prevent rendering Pagination without data
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