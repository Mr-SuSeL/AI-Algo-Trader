// frontend/app/terms/page.js
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-gray-100 text-center">Terms of Service</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">1. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            By accessing and using the AI Algo Trader website and its services (the "Service"), you accept and agree to be bound by these **Terms of Service** ("Terms"). If you do not agree to these Terms, please do not use the Service. We reserve the right to update and change these Terms from time to time without notice. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">2. Description of Service</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            AI Algo Trader provides a blog with articles related to algorithmic trading and AI, as well as a chatroom for real-time communication among users. The Service is provided "as is" and "as available" for your personal, non-commercial use only. We may modify, suspend, or discontinue any aspect of the Service at any time, including the availability of any feature, database, or content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">3. User Conduct</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            You agree to use the Service responsibly and in compliance with all applicable laws and regulations. You must not:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-4 leading-relaxed">
            <li>Post or transmit any unlawful, threatening, abusive, libelous, defamatory, obscene, vulgar, pornographic, profane, or indecent information of any kind.</li>
            <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
            <li>Upload or transmit any content that infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
            <li>Engage in any activity that could harm, disable, overburden, or impair the Service or interfere with any other party's use and enjoyment of the Service.</li>
            <li>Use the chatroom for any commercial solicitations, advertising, or spamming.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">4. Intellectual Property</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            All content on AI Algo Trader, including text, graphics, logos, images, and software, is the property of AI Algo Trader or its content suppliers and protected by international copyright laws. You may not reproduce, distribute, modify, or create derivative works of any content without explicit written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">5. Disclaimers</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            The content on AI Algo Trader is for informational and educational purposes only and does not constitute financial, investment, or trading advice. We do not guarantee the accuracy, completeness, or usefulness of any information on the Service. Any reliance you place on such information is strictly at your own risk. Trading involves substantial risk of loss and is not suitable for every investor.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">6. Limitation of Liability</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            In no event shall AI Algo Trader, its affiliates, or their respective directors, employees, or agents be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">7. Governing Law</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.
          </p>
        </section>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">
          *Last Updated: June 7, 2025*
        </p>
      </main>
      <Footer />
    </div>
  );
}