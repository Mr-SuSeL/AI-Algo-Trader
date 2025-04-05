"use client"
import React, { useState } from 'react'
import { logoutUser } from '@/utils/auth';

export default function Home() {

  const [user, setUser] = useState(null)

  const handleLogout = async () => {
    await logoutUser();
  }

  return (
    <div className="fixed right-[20%]">
      <button onClick={handleLogout}
        className="bg-red-500 hover:bg-red-400 text-white font-medium py-2 px-4 rounded transition-colors cursor-pointer"         
      >
      Logout
      </button>
    </div>
  )
}