"use client"; // Ten komponent musi być Client Component

import React from 'react';

export default function HelloUser({ user, isLoggedIn }) {
  return (
    <div className="px-10 py-5 bg-gray-100 ">
      {isLoggedIn && user ? (
        <h1 className="text-xl font-bold">Cześć, {user.username}!</h1>
      ) : null}
    </div>
  );
}