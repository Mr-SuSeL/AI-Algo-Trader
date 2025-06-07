// C:\AI-Algo-Trader\frontend\app\chat\page.js
'use client'; // This component must be a client component to use hooks and WebSocket API

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/AuthContext'; // Import useAuth hook
import Navbar from '@/components/Navbar'; // Assuming Navbar is in components folder
import Footer from '@/components/Footer'; // Assuming Footer is in components folder

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [roomName, setRoomName] = useState('general'); // Default chat room
  const [nickname, setNickname] = useState(''); // User's nickname for chat
  const ws = useRef(null); // useRef to persist WebSocket instance across renders
  const reconnectAttempts = useRef(0); // Track reconnection attempts
  const maxReconnectAttempts = 5; // Max attempts before giving up
  const reconnectDelay = 2000; // 2 seconds delay between reconnect attempts

  const { user, loading } = useAuth(); // Get user and loading state from AuthContext
  const messagesEndRef = useRef(null); // Ref for scrolling to the latest message

  // --- Utility functions ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- WebSocket Connection Logic ---
  const connectWebSocket = useCallback(() => {
    // Only attempt to connect if the user is logged in and not currently loading auth data
    if (user && !loading && !ws.current) {
      console.log(`Attempting WebSocket connection: ws://localhost:8001/ws/chat/${roomName}/ (Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

      const newWs = new WebSocket(`ws://localhost:8001/ws/chat/${roomName}/`);

      newWs.onopen = () => {
        console.log('Connected to WebSocket!');
        reconnectAttempts.current = 0; // Reset attempts on successful connection
        // Set nickname if user is available and nickname is not already set
        if (user && !nickname) {
          setNickname(user.username || user.email || 'Anonymous');
        }
      };

      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Message received:', data);
        setMessages((prevMessages) => [...prevMessages, data]);
      };

      newWs.onclose = (event) => {
        console.log(`Disconnected from WebSocket. Code: ${event.code}, Reason: ${event.reason || 'None'}.`);
        ws.current = null; // Clear the WebSocket instance
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) { // 1000 is normal closure
          reconnectAttempts.current++;
          console.log(`Reconnecting in ${reconnectDelay / 1000} seconds (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          setTimeout(connectWebSocket, reconnectDelay);
        } else if (event.code === 4001) {
            console.log('Authentication failed, not reconnecting.');
            // Optionally, redirect to login page or show an error
        }
      };

      newWs.onerror = (error) => {
        console.error('WebSocket Error:', error);
        newWs.close(); // Attempt to close the socket to trigger onclose logic
      };

      ws.current = newWs; // Store the WebSocket instance
    } else if (!user && !loading) {
        console.log('Connect WebSocket: User not authenticated, skipping connection.');
    } else if (user && loading) {
        console.log('Connect WebSocket: User status still loading, skipping connection for now.');
    } else if (ws.current) {
        console.log('Connect WebSocket: Already connected.');
    }
  }, [roomName, user, loading, nickname]); // Dependencies for useCallback

  // Effect to manage WebSocket connection based on roomName and user authentication
  useEffect(() => {
    // If WebSocket exists, close it first to ensure a clean reconnect or room switch
    if (ws.current) {
      console.log('Cleanup return: Closing existing WebSocket.');
      ws.current.close();
      ws.current = null; // Clear the reference immediately
    }

    // Only attempt to connect if user is authenticated and loading is complete
    if (user && !loading) {
      connectWebSocket();
    }

    // Cleanup function: Close WebSocket when component unmounts or dependencies change
    return () => {
      if (ws.current) {
        console.log('Cleanup return: Closing WebSocket.');
        ws.current.close();
        ws.current = null; // Important: Clear the ref on cleanup
      }
    };
  }, [roomName, user, loading, connectWebSocket]); // Reconnect when room, user, or loading status changes

  // Effect to scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Message Handling ---
  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && messageInput.trim() !== '') {
      const messageData = {
        message: messageInput.trim(),
        username: nickname, // Use the state nickname
      };
      ws.current.send(JSON.stringify(messageData));
      setMessageInput(''); // Clear input after sending
    } else {
      console.warn('WebSocket not open or message is empty. Cannot send.');
      // Optionally, provide user feedback if WS is not open
    }
  };

  const handleRoomChange = (newRoom) => {
    setRoomName(newRoom);
    setMessages([]); // Clear messages when room changes
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <Navbar />
        <h1 className="text-2xl mt-4">Loading chat...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <Navbar />
        <h1 className="text-2xl mt-4">Chat is only available for logged-in users.</h1>
        <p className="text-lg">Please <Link href="/login" className="text-blue-500 hover:underline">log in</Link> to access the chat.</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Chat Rooms Sidebar */}
        <aside className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Chat Rooms</h2>
          <ul>
            {['general', 'trading', 'technical', 'management'].map((room) => (
              <li key={room} className="mb-2">
                <button
                  onClick={() => handleRoomChange(room)}
                  className={`w-full text-left py-2 px-3 rounded-md transition duration-200
                              ${roomName === room
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                              }`}
                >
                  {room.charAt(0).toUpperCase() + room.slice(1)} {/* Capitalize first letter */}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Current Room: {roomName.charAt(0).toUpperCase() + roomName.slice(1)}
          </h2>

          {/* Messages Display */}
          <div className="flex-grow overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md p-3 mb-4 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 rounded-lg ${msg.username === (user?.username || user?.email) ? 'bg-blue-100 dark:bg-blue-700 ml-auto' : 'bg-gray-100 dark:bg-gray-700'} max-w-[80%]`}>
                <span className="font-semibold text-blue-700 dark:text-blue-300">{msg.username}:</span> {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
          </div>

          {/* Message Input and Send Button */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Your Nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-1/4 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
              className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!ws.current || ws.current.readyState !== WebSocket.OPEN || !nickname} // Disable if WS not open or no nickname
            >
              Send
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
