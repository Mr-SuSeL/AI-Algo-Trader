// components/Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPosts, postsPerPage, paginate }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
        pageNumbers.push(i);
    }

    const maxPagesToShow = 5;
    let startPage;
    let endPage;

    if (pageNumbers.length <= maxPagesToShow) {
        startPage = 1;
        endPage = pageNumbers.length;
    } else {
        if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage >= pageNumbers.length - Math.floor(maxPagesToShow / 2)) {
            startPage = pageNumbers.length - maxPagesToShow + 1;
            endPage = pageNumbers.length;
        } else {
            startPage = currentPage - Math.floor(maxPagesToShow / 2);
            endPage = currentPage + Math.floor(maxPagesToShow / 2);
        }
    }

    const renderPageNumbers = pageNumbers
        .slice(startPage - 1, endPage)
        .map(number => (
            <button
                key={number}
                onClick={() => paginate(number)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === number ? 'bg-indigo-600 text-white hover:bg-indigo-500' : ''}`}
            >
                {number}
            </button>
        ));

    const renderPreviousButton = (
        <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
            <span className="sr-only">Poprzednia</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
        </button>
    );

    const renderNextButton = (
        <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalPosts / postsPerPage)}
            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
            <span className="sr-only">Następna</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
        </button>
    );

    return (
        <div className="flex items-center justify-center mt-8">
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {renderPreviousButton}
                {startPage > 1 && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>
                )}
                {renderPageNumbers}
                {endPage < pageNumbers.length && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>
                )}
                {renderNextButton}
            </nav>
        </div>
    );
};

export default Pagination;