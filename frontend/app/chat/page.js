// C:\AI-Algo-Trader\frontend\app\chat\page.js
'use client'; // Ten komponent musi być komponentem klienckim w Next.js App Router

import React, { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('general'); // Domyślny pokój czatu
  const ws = useRef(null); // useRef do przechowywania instancji WebSocket
  const isMounted = useRef(true); // Flaga do śledzenia montowania komponentu
  const reconnectAttempt = useRef(0); // Licznik prób ponownego łączenia
  const MAX_RECONNECT_ATTEMPTS = 5; // Maksymalna liczba prób ponownego łączenia
  const RECONNECT_DELAY = 2000; // Opóźnienie przed ponowną próbą łączenia (ms)

  // Funkcja do inicjalizacji połączenia WebSocket
  const connectWebSocket = () => {
    // Zapobiegaj wielokrotnym połączeniom lub łączeniu, gdy komponent jest odmontowany
    // lub gdy połączenie jest już otwarte.
    if (!isMounted.current || (ws.current && ws.current.readyState === WebSocket.OPEN)) {
      console.log('Connect WebSocket: Warunek niespełniony, pomijam łączenie.');
      return;
    }

    // Ustawienie nazwy użytkownika
    let storedUsername = localStorage.getItem('chatUsername');
    if (!storedUsername) {
      storedUsername = prompt('Podaj swoją nazwę użytkownika do czatu:') || 'Anonim';
      localStorage.setItem('chatUsername', storedUsername);
    }
    setUsername(storedUsername);

    console.log(`Próba połączenia z WebSocket: ws://localhost:8001/ws/chat/${roomName}/ (Próba ${reconnectAttempt.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    // Tworzenie nowej instancji WebSocket
    ws.current = new WebSocket(`ws://localhost:8001/ws/chat/${roomName}/`);

    ws.current.onopen = () => {
      console.log('Połączono z WebSocket!');
      reconnectAttempt.current = 0; // Zresetuj licznik po udanym połączeniu
    };

    ws.current.onmessage = (event) => {
      // Odbierz wiadomość, sparsuj JSON i dodaj do stanu
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log('Odebrano wiadomość:', data);
    };

    ws.current.onclose = (event) => {
      console.warn(`Rozłączono z WebSocket. Kod: ${event.code}, Powód: ${event.reason || 'Brak'}.`);
      // Sprawdź, czy komponent jest nadal zamontowany i czy nie przekroczono limitu prób
      // Nie próbujemy ponownie łączyć, jeśli jest to normalne zamknięcie (kod 1000)
      if (isMounted.current && event.code !== 1000 && reconnectAttempt.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempt.current += 1;
        setTimeout(() => {
          connectWebSocket(); // Ponów próbę za określonym opóźnieniem
        }, RECONNECT_DELAY);
      } else if (!isMounted.current) {
        console.log("WebSocket rozłączony, ale komponent odmontowany. Nie próbuję ponownie łączyć.");
      } else {
        console.error("Przekroczono maksymalną liczbę prób ponownego łączenia. WebSocket pozostaje rozłączony.");
      }
    };

    ws.current.onerror = (error) => {
      console.error('Błąd WebSocket:', error);
      // onclose zostanie wywołane po błędzie, obsługa ponownego łączenia jest tam
    };
  };

  // Efekt do inicjalizacji połączenia przy montowaniu i zmianie pokoju
  useEffect(() => {
    isMounted.current = true; // Komponent jest zamontowany

    // NIE ZAMYKAMY JUŻ JAWNIE POŁĄCZENIA TUTAJ.
    // Zamiast tego polegamy na logice w connectWebSocket (która sprawdza readyState)
    // oraz na funkcji czyszczącej, która zajmuje się zamknięciem na końcu cyklu życia efektu.

    // Nawiąż nowe połączenie
    connectWebSocket();

    // Funkcja czyszcząca, która zamyka połączenie WebSocket, gdy komponent zostanie odmontowany
    // lub przed ponownym uruchomieniem efektu (np. przy zmianie roomName)
    return () => {
      isMounted.current = false; // Komponent zostanie odmontowany
      if (ws.current) {
        console.log("Cleanup return: Zamykam WebSocket.");
        // Zamknij połączenie z kodem 1000 (normal closure), aby serwer wiedział, że to zamierzone
        ws.current.close(1000, "Component unmount cleanup");
        ws.current = null; // Wyczyść referencję
      }
    };
  }, [roomName, RECONNECT_DELAY]); // Dodano RECONNECT_DELAY jako zależność, jeśli jego wartość miałaby się zmieniać dynamicznie

  // Funkcja wysyłania wiadomości
  const sendMessage = (e) => {
    e.preventDefault(); // Zapobiegaj domyślnemu przeładowaniu strony
    if (ws.current?.readyState === WebSocket.OPEN && inputMessage.trim()) {
      const messageData = {
        username: username,
        message: inputMessage,
      };
      ws.current.send(JSON.stringify(messageData));
      setInputMessage(''); // Wyczyść pole wprowadzania
    } else {
      console.warn('Nie można wysłać wiadomości: WebSocket nie jest otwarty lub wiadomość pusta.', ws.current?.readyState);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Chat w Pokoju: {roomName}</h1>
      <p>Witaj, {username}!</p>

      <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'scroll', padding: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Wpisz wiadomość..."
          style={{ flexGrow: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px 0 0 4px' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}
        >
          Wyślij
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <label htmlFor="roomSelect">Zmień pokój: </label>
        <select
          id="roomSelect"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          <option value="general">general</option>
          <option value="trading">trading</option>
          <option value="bots">bots</option>
        </select>
      </div>
    </div>
  );
}
