"use client"
import React, { useState } from 'react'
import { loginUser } from '@/utils/auth'

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [toast, setToast] = useState(null)

    // Funkcja do pokazywania toastów
    const showToast = (message, type) => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 5000) // Autoukrywanie po 5 sekundach
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (email === "" || password === "") {
            showToast("Please fill in all fields", "error")
            return
        }
        
        try {
            await loginUser(email, password)
            showToast("User logged in successfully!", "success")
        } catch (e) {
            showToast(`Login failed: ${e.message}`, "error")
        }
    }

    return (
        <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md shadow-lg ${
                    toast.type === "success" 
                        ? "bg-green-500 text-white" 
                        : "bg-red-100 text-red-800 border border-red-300"
                }`}>
                    <div className="flex items-center justify-between">
                        <span>{toast.message}</span>
                        <button 
                            onClick={() => setToast(null)} 
                            className="ml-4 text-current hover:text-gray-700"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-gray-300 p-8 flex flex-col rounded-lg w-full max-w-md shadow-lg"> 
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
                    Login
                </button>
            </form>
        </div>
    )
}