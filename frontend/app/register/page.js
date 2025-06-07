"use client";
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/utils/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link'; // <--- DODAJ TĘ LINIĘ

export default function RegisterPage() {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (userName === "" || email === "" || password === "") {
            toast.error("Please fill in all fields.");
            return;
        }
        try {
            await registerUser(email, userName, password);
            toast.success("User created successfully!");
            setTimeout(() => {
                router.push('/login');
            }, 1000);
        } catch (error) {
            toast.error("User creation failed! " + (error.message || "An unexpected error occurred."));
        }
    };

    return (
        <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-8 flex flex-col rounded-lg w-full max-w-md shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register</h2>
                <label className="text-gray-800 mb-1 font-medium">Username</label>
                <input
                    className="bg-gray-200 text-gray-800 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    value={userName}
                    required
                    onChange={(e) => setUserName(e.target.value)}
                />

                <label className="text-gray-800 mb-1 font-medium">Email</label>
                <input
                    className="bg-gray-200 text-gray-800 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label className="text-gray-800 mb-1 font-medium">Password</label>
                <input
                    className="bg-gray-200 text-gray-800 p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="bg-blue-600 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded transition-colors cursor-pointer"
                    type="submit"
                >
                    Register
                </button>
                <div className="mt-4 text-center">
                    <Link href="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                        Already have an account? Login!
                    </Link>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}