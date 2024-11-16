import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const socket = io("https://sweetserver.onrender.com");

const Chat = ({ roomId, onLogout }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const messageInputRef = useRef(null);

  // Retrieve username from local storage
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('previousMessages', (previousMessages) => {
      setMessages(previousMessages);
    });

    socket.on('receiveMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('previousMessages');
      socket.off('receiveMessage');
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toISOString();
      socket.emit('sendMessage', { roomId, username, message, timestamp });
      setMessage('');
      if (messageInputRef.current) {
        messageInputRef.current.style.height = 'auto';
      }
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight - 17}px`;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Room: {roomId}</h2>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="message"
            style={{
              justifyContent: msg.username === username ? 'flex-end' : 'flex-start',
            }}
          >
            <p
              className="message-username"
              style={{
                alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.username}
            </p>
            <div
              className={`message-content ${msg.username === username ? 'user-message' : 'other-message'}`}
            >
              <p>{msg.message}</p>
              <small className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-footer">
        <textarea
          ref={messageInputRef}
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onInput={autoResize}
          placeholder="Type a message..."
          rows={1}
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
