// C:\AI-Algo-Trader\frontend\app\chat\page.js
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  // Ustawienie początkowej nazwy pokoju na "trading" lub inną, która pasuje do nowych nazw
  const [roomName, setRoomName] = useState('trading');
  const [nickname, setNickname] = useState('');
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;

  const { user, loading } = useAuth();
  const messagesEndRef = useRef(null);

  const [toast, setToast] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && !loading && !nickname) {
      setNickname(user.username || user.email || 'Anonymous');
      console.log('Initial nickname set:', user.username || user.email || 'Anonymous');
    }
  }, [user, loading]);

  // WebSocket Connection Logic
  const connectWebSocket = useCallback(() => {
    // If a connection already exists, and it's for the current room, do nothing.
    // This prevents creating duplicate connections for the same room.
    if (ws.current && ws.current.url.includes(`/ws/chat/${roomName}/`)) {
      console.log(`connectWebSocket: Already connected to ${roomName}, skipping.`);
      return;
    }

    // Explicitly close any existing connection before opening a new one for a different room
    if (ws.current) {
        console.log(`connectWebSocket: Closing existing WebSocket for room ${ws.current.url.split('/').slice(-2, -1)[0]} to connect to ${roomName}.`);
        ws.current.close(1000, 'Room change'); // Use 1000 for normal closure
        ws.current = null; // Clear the ref immediately to ensure onopen won't be blocked
    }


    if (user && !loading && nickname) {
      console.log(`Attempting WebSocket connection: ws://localhost:8001/ws/chat/${roomName}/ (Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

      const newWs = new WebSocket(`ws://localhost:8001/ws/chat/${roomName}/`);

      newWs.onopen = () => {
        console.log(`Connected to WebSocket for room: ${roomName}!`);
        reconnectAttempts.current = 0;

        if (user && !localStorage.getItem(`nickname_toast_shown_${user.id}_${roomName}`)) {
            // Format roomName for display in toast
            const displayRoomName = roomName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').replace(/&/, ' & ');
            showToast(`Welcome to "${displayRoomName}" chat, ${nickname}! You can change your nickname below.`, 'info', 7000);
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
        if (ws.current === newWs) { // Only clear if this was the active WebSocket
            ws.current = null;
        }

        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) { // 1000 is normal closure
          reconnectAttempts.current++;
          showToast(`WebSocket disconnected. Reconnecting to ${roomName} in ${reconnectDelay / 1000}s... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`, 'error');
          setTimeout(connectWebSocket, reconnectDelay);
        } else if (event.code === 4001) {
            console.log('Authentication failed, not reconnecting.');
            showToast('Authentication failed. Please log in again.', 'error');
        } else if (event.code === 1000) {
            console.log('WebSocket closed normally.');
        } else {
            showToast('WebSocket connection error. Please refresh the page.', 'error');
        }
      };

      newWs.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Do not close here, let onclose handle it to prevent double logging or unexpected state.
        // newWs.close();
      };

      ws.current = newWs;
    } else if (!user && !loading) {
        console.log('Connect WebSocket: User not authenticated, skipping connection.');
        // showToast('Please log in to use the chat.', 'info'); // This might be annoying if logged out frequently
    } else if (user && loading) {
        console.log('Connect WebSocket: User status still loading, skipping connection for now.');
    } else if (!nickname && user && !loading) {
        console.log('Connect WebSocket: Nickname not yet set, waiting.');
    }
  }, [roomName, user, loading, nickname, showToast]);


  // Effect to manage WebSocket connection based on roomName and user authentication.
  // This useEffect now explicitly ensures connection or re-connection.
  useEffect(() => {
    // This cleanup function is crucial: it will run when dependencies change or component unmounts.
    // It closes the *currently active* WebSocket connection.
    return () => {
      if (ws.current) {
        console.log('Cleanup return: Closing WebSocket.');
        ws.current.close(1000, 'Component unmount or dependency change');
        ws.current = null;
      }
    };
  }, []); // Empty dependency array means this cleanup runs only on component unmount.
          // The actual connection/reconnection logic is now handled by connectWebSocket
          // and triggered by the separate useEffect below.


  useEffect(() => {
    // This effect triggers the connection when roomName, user, loading, or nickname changes.
    // connectWebSocket itself contains logic to prevent duplicate connections.
    if (user && !loading && nickname) {
        // Clear localStorage item for nickname toast on room change to show it again if needed
        localStorage.removeItem(`nickname_toast_shown_${user.id}_${roomName}`);
        connectWebSocket();
    } else if (!user && !loading) {
        // If user logs out, ensure WebSocket is closed
        if (ws.current) {
            ws.current.close(1000, 'User logged out');
            ws.current = null;
        }
    }
  }, [roomName, user, loading, nickname, connectWebSocket]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && messageInput.trim() !== '' && nickname.trim() !== '') {
      const messageData = {
        message: messageInput.trim(),
        username: nickname.trim(),
        timestamp: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(messageData));
      setMessageInput('');
    } else {
      let warnMessage = '';
      let toastType = 'warning';
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        warnMessage = 'Chat connection not open. Please wait or try refreshing.';
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

  const handleRoomChange = useCallback(async (newRoomSlug) => {
    if (roomName === newRoomSlug) return; // Don't do anything if trying to switch to the same room

    console.log(`handleRoomChange: Attempting to switch from ${roomName} to ${newRoomSlug}.`);

    // Explicitly close the current WebSocket connection if it exists
    if (ws.current) {
      console.log('handleRoomChange: Closing current WebSocket before changing room.');
      // Create a Promise that resolves when the WebSocket is actually closed
      const closePromise = new Promise((resolve) => {
        const currentWs = ws.current;
        currentWs.onclose = (event) => {
          console.log(`WebSocket for room ${currentWs.url.split('/').slice(-2, -1)[0]} closed successfully. Code: ${event.code}, Reason: ${event.reason || 'None'}`);
          // Ensure ws.current is cleared *after* this onclose fires for the current socket
          if (ws.current === currentWs) {
              ws.current = null; // Clear the ref
          }
          resolve(); // Resolve the promise
        };
        currentWs.close(1000, 'Room change initiated'); // Request closure
      });
      // Wait for the current WebSocket to close before proceeding
      await closePromise;
    }

    setRoomName(newRoomSlug); // Update roomName state
    setMessages([]); // Clear messages when room changes
    reconnectAttempts.current = 0; // Reset reconnect attempts for the new room
    // The useEffect that depends on roomName will then trigger connectWebSocket.
    console.log(`handleRoomChange: Room set to ${newRoomSlug}.`);
  }, [roomName]); // Only re-create if roomName changes


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

  // Definiujemy mapowanie wyświetlanych nazw pokoi na slug (URL-friendly)
  const roomDisplayNames = [
    'Trading',
    'Algorithmic Trading',
    'Quantitative Trading',
    'High Frequency Trading',
    'Machine Learning',
    'Cloud Solutions',
    'TradingView & PineScript',
    'MetaTrader & MQL',
    'Futures',
    'Options',
    'Cryptocurrency Trading',
    'C++ Programming',
    'Python Programming'
  ];

  // Funkcja pomocnicza do konwersji display name na slug
  const getRoomSlug = (displayName) => {
    return displayName.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
  };

  // Funkcja pomocnicza do konwersji slug na display name
  const getDisplayRoomName = (slug) => {
    // Odwracamy proces: replace '_' with ' ', then capitalize each word
    let displayName = slug.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    // Handle the '&' case
    if (displayName.includes('tradingview')) displayName = displayName.replace('tradingview_&_pinescript', 'TradingView & PineScript');
    if (displayName.includes('metatrader')) displayName = displayName.replace('metatrader_&_mql', 'MetaTrader & MQL');
    return displayName;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Chat Rooms Sidebar */}
        <aside className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Chat Rooms</h2>
          <ul>
            {roomDisplayNames.map((room) => (
              <li key={room} className="mb-2">
                <button
                  onClick={() => handleRoomChange(getRoomSlug(room))}
                  className={`w-full text-left py-2 px-3 rounded-md transition duration-200
                                ${roomName === getRoomSlug(room)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                >
                  {room} {/* Wyświetlamy oryginalną, czytelną nazwę */}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Current Room: {getDisplayRoomName(roomName)}
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
              // The button is enabled if WS is open, message not empty, and nickname not empty.
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