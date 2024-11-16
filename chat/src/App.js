import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [activeRoomId, setActiveRoomId] = useState('');

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUserName = localStorage.getItem('username');
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  const handleUserNameChange = (e) => {
    const name = e.target.value;
    setUserName(name);
    localStorage.setItem('username', name);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      setActiveRoomId(roomId);
    }
  };

  const logoutRoom = () => {
    setActiveRoomId(''); // Reset active room
    setRoomId(''); // Clear room ID input
  };

  return (
    <div className="App">
      {!activeRoomId ? (
        <div className="form-container">
          <h1>Join a Chat Room</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={handleUserNameChange}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="input-field"
          />
          <button onClick={joinRoom} className="join-button">Join Room</button>
        </div>
      ) : (
        <Chat roomId={activeRoomId} onLogout={logoutRoom} />
      )}
    </div>
  );
}

export default App;
