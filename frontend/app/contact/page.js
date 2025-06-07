// frontend/app/contact/page.js
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'; // Potrzebne ikonki

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">Contact Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have questions, feedback, or just want to connect, feel free to reach out using the information below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
          {/* Email */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
            <FaEnvelope className="text-blue-500 text-4xl mb-4 dark:text-blue-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Email Us</h2>
            <p className="text-gray-700 dark:text-gray-300 break-words">
              <a href="mailto:info@aialgotrader.com" className="text-blue-500 hover:underline dark:text-blue-400">info@aialgotrader.com</a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 break-words">
              <a href="mailto:support@aialgotrader.com" className="text-blue-500 hover:underline dark:text-blue-400">support@aialgotrader.com</a>
            </p>
          </div>

          {/* Phone (Mockup) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
            <FaPhone className="text-green-500 text-4xl mb-4 dark:text-green-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Call Us</h2>
            <p className="text-gray-700 dark:text-gray-300">(123) 456-7890</p>
            <p className="text-gray-700 dark:text-gray-300">(098) 765-4321</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Available M-F, 9 AM - 5 PM (CET)</p>
          </div>

          {/* Address (Mockup) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
            <FaMapMarkerAlt className="text-red-500 text-4xl mb-4 dark:text-red-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Our Office</h2>
            <p className="text-gray-700 dark:text-gray-300">123 Algo Street</p>
            <p className="text-gray-700 dark:text-gray-300">Trader City, 00-123</p>
            <p className="text-gray-700 dark:text-gray-300">Quantland</p>
          </div>
        </div>

        {/* Sekcja "Find Us on Social Media" */}
        <section className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Connect With Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Follow us on our social media channels to stay updated with the latest news, articles, and community discussions.
          </p>
          {/* Możesz tutaj wkleić ikony z linkami do mediów społecznościowych, tak jak masz w stopce */}
          <div className="flex justify-center space-x-6 text-2xl">
             {/* Przykładowe ikony - wklej wszystkie, które masz w Footerze */}
             <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400" aria-label="Facebook">
               <FaEnvelope /> {/* Zastąp prawdziwymi ikonami z Footer.js */}
             </a>
             <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400" aria-label="Twitter">
               <FaPhone /> {/* Zastąp prawdziwymi ikonami z Footer.js */}
             </a>
             <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400" aria-label="LinkedIn">
               <FaMapMarkerAlt /> {/* Zastąp prawdziwymi ikonami z Footer.js */}
             </a>
             {/* Wklej pozostałe ikony z Footer.js tutaj */}
             {/* Przykład: */}
             {/*
             <Link href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                <FaFacebook size={24} />
             </Link>
             <Link href="#" className="text-gray-600 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400">
                <FaTwitter size={24} />
             </Link>
             ...
             */}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            We look forward to connecting with you!
          </p>
        </section>

      </main>
      <Footer />
    </div>
  );
}