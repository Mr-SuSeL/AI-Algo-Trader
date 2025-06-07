// frontend/app/book/page.js
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100">Our Book</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center max-w-2xl">
          This page will eventually contain information about our upcoming book on algorithmic trading and AI.
          Stay tuned for updates! Firsty will show book about Forex - it's in translating process
        </p>
        {/* Możesz tu dodać więcej treści, obrazki, formularz zapisu na newsletter itp. */}
      </main>
      <Footer />
    </div>
  );
}