// components/Footer.js
import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaDiscord, FaSlack, FaYoutube, FaLinkedin, FaGithub } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-300">
              AI Algo Trader is a platform for automated algorithmic trading.
              Our mission is to make advanced trading tools accessible to everyone.
              Also check out <Link href="https://reachme.io/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">ReachMe.io</Link>.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="text-sm text-gray-300">
              <li>
                <Link href="/terms" className="hover:text-gray-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-blue-500">
                <FaFacebook size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-sky-500">
                <FaTwitter size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-pink-500">
                <FaInstagram size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-purple-500">
                <FaDiscord size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-[#4A154B]">
                <FaSlack size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-red-600">
                <FaYoutube size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-blue-600">
                <FaLinkedin size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-gray-400">
                <FaGithub size={24} />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AI Algo Trader. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;