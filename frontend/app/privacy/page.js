// frontend/app/privacy/page.js
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Privacy Policy</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Your privacy is important to us. It is AI Algo Trader's policy to respect your privacy regarding any information we may collect from you across our website.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
        </p>
        {/* Możesz tu dodać pełny tekst polityki prywatności */}
        <p className="text-gray-700 dark:text-gray-300">
          More detailed policy will be provided soon.
        </p>
      </main>
      <Footer />
    </div>
  );
}