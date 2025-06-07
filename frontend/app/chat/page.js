// C:\AI-Algo-Trader\frontend\app\chat\page.js
'use client'; // This component must be a client component to use hooks and WebSocket API

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/AuthContext'; // Import useAuth hook
import Navbar from '@/components/Navbar'; // Assuming Navbar is in components folder
import Footer from '@/components/Footer'; // Assuming Footer is in components folder
import Link from 'next/link';

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

  // State for toast notifications
  const [toast, setToast] = useState(null); // { message: '...', type: 'success' | 'error' | 'info' | 'warning' }

  // --- Utility functions ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Callback to show toast messages
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer); // Cleanup timer if component unmounts
  }, []);

  // Effect to set initial nickname when user data is loaded
  // This runs once when user data is ready
  useEffect(() => {
    if (user && !loading && !nickname) { // Only set if user is loaded and nickname isn't already set by user
      setNickname(user.username || user.email || 'Anonymous');
      console.log('Initial nickname set:', user.username || user.email || 'Anonymous');
    }
  }, [user, loading]); // Depend only on user and loading, not on nickname itself

  // --- WebSocket Connection Logic ---
  const connectWebSocket = useCallback(() => {
    // Prevent multiple connections
    if (ws.current) {
        console.log('connectWebSocket: Already connected, skipping.');
        return;
    }

    // Only attempt to connect if the user is logged in and not currently loading auth data
    // AND nickname is set (important for initial connection validity)
    if (user && !loading && nickname) {
      console.log(`Attempting WebSocket connection: ws://localhost:8001/ws/chat/${roomName}/ (Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

      const newWs = new WebSocket(`ws://localhost:8001/ws/chat/${roomName}/`);

      newWs.onopen = () => {
        console.log('Connected to WebSocket!');
        reconnectAttempts.current = 0; // Reset attempts on successful connection

        // Show toast for nickname if it's the first connection for this user in this room
        if (user && !localStorage.getItem(`nickname_toast_shown_${user.id}_${roomName}`)) {
            showToast(`Welcome to "${roomName.charAt(0).toUpperCase() + roomName.slice(1)}" chat, ${nickname}! You can change your nickname below.`, 'info', 7000);
            localStorage.setItem(`nickname_toast_shown_${user.id}_${roomName}`, 'true');
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
          showToast(`WebSocket disconnected. Reconnecting in ${reconnectDelay / 1000}s... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`, 'error');
          setTimeout(connectWebSocket, reconnectDelay);
        } else if (event.code === 4001) {
            console.log('Authentication failed, not reconnecting.');
            showToast('Authentication failed. Please log in again.', 'error');
        } else if (event.code === 1000) {
            console.log('WebSocket closed normally.');
            // showToast('Disconnected from chat.', 'info'); // Optional toast for normal closure
        } else {
            showToast('WebSocket connection error. Please refresh the page.', 'error');
        }
      };

      newWs.onerror = (error) => {
        console.error('WebSocket Error:', error);
        newWs.close(); // Attempt to close the socket to trigger onclose logic
      };

      ws.current = newWs; // Store the WebSocket instance
    } else if (!user && !loading) {
        console.log('Connect WebSocket: User not authenticated, skipping connection.');
        showToast('Please log in to use the chat.', 'info'); // Toast for non-logged-in users
    } else if (user && loading) {
        console.log('Connect WebSocket: User status still loading, skipping connection for now.');
    } else if (!nickname && user && !loading) {
        // This case is handled by the primary useEffect which waits for nickname to be set
        console.log('Connect WebSocket: Nickname not yet set, waiting.');
    }
  }, [roomName, user, loading, nickname, showToast]); // IMPORTANT: Keep nickname here for the initial connection condition

  // Effect to manage WebSocket connection based on roomName and user authentication.
  // This useEffect focuses on establishing/re-establishing the connection when room/user/loading status changes.
  useEffect(() => {
    // This part ensures a clean state before attempting connection or on unmount/room change
    return () => {
      if (ws.current) {
        console.log('Cleanup return: Closing WebSocket.');
        ws.current.close();
        ws.current = null;
      }
    };
  }, [roomName, user, loading]); // Dependencies for cleanup: only room, user, loading

  // Effect to initiate or re-initiate WebSocket connection based on essential dependencies.
  // This effect runs after nickname is set and when room/user/loading status changes.
  useEffect(() => {
    // Only connect if user, nickname, and roomName are ready
    if (user && !loading && nickname) {
        // Clear localStorage item for nickname toast on room change to show it again if needed
        localStorage.removeItem(`nickname_toast_shown_${user.id}_${roomName}`);
        connectWebSocket(); // Attempt to connect
    }
  }, [roomName, user, loading, nickname, connectWebSocket]); // Include nickname here to trigger connection when it's ready

  // Effect to scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Message Handling ---
  const sendMessage = () => {
    // Condition remains the same: WS must be open, message and nickname not empty
    if (ws.current && ws.current.readyState === WebSocket.OPEN && messageInput.trim() !== '' && nickname.trim() !== '') {
      const messageData = {
        message: messageInput.trim(),
        username: nickname.trim(),
        timestamp: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(messageData));
      setMessageInput(''); // Clear input after sending
    } else {
      let warnMessage = '';
      let toastType = 'warning';
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        warnMessage = 'Chat connection not open.';
        toastType = 'error';
      } else if (messageInput.trim() === '') {
        warnMessage = 'Message cannot be empty.';
      } else if (nickname.trim() === '') {
        warnMessage = 'Nickname cannot be empty. Please set your nickname.';
      }
      if (warnMessage) {
        console.warn(warnMessage + ' Cannot send message.');
        showToast(warnMessage, toastType);
      }
    }
  };

  const handleRoomChange = (newRoom) => {
    // When room changes, we need to explicitly close the current WS connection
    // to force a new one for the new room.
    if (ws.current) {
      console.log('handleRoomChange: Closing WebSocket for room change.');
      ws.current.close();
      ws.current = null; // Important: Clear the ref
    }
    setRoomName(newRoom);
    setMessages([]); // Clear messages when room changes
    // The useEffect for connection will then pick up the new roomName and re-connect
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
          <div className="flex-grow overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md p-3 mb-4 space-y-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 rounded-lg ${msg.username === (user?.username || user?.email) ? 'bg-blue-100 dark:bg-blue-700 ml-auto' : 'bg-gray-100 dark:bg-gray-700'} max-w-[80%]`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">{msg.username}:</span>
                  {msg.timestamp && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  )}
                </div>
                <div>{msg.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input and Send Button */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Your Nickname"
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
              disabled={!ws.current || ws.current.readyState !== WebSocket.OPEN || messageInput.trim() === '' || nickname.trim() === ''}
            >
              Send
            </button>
          </div>
        </section>
      </main>
      <Footer />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-3 rounded-lg shadow-lg text-white font-semibold flex items-center
            ${toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}