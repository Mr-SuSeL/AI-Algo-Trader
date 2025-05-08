"use client"
import React, { useState, useEffect } from 'react'
import { getUserInfo } from '@/utils/auth';
import Navbar from '../components/Navbar'; // Upewnij się, że ścieżka jest poprawna

export default function Home() {
	const [user, setUser] = useState(null);
	
	useEffect(() => {
		const getUser = async () => {
			const userDetails = await getUserInfo();
			if (userDetails) {
				setUser(userDetails);
			}
		};
		getUser();
	}, []);


	return (
		<div>
			<Navbar /> {/* Dodaj navbar */}

			<div className="m-10">
				{user ? <h1>Hi, {user.username}</h1> : <h1>Welcome stranger!</h1>}
			</div>
		</div>
	);
}