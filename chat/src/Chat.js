import React, { useState, useEffect, useRef } from "react";
import { FaImage } from "react-icons/fa"; // FontAwesome image icon
import io from "socket.io-client";
import "./Chat.css";

const socket = io("https://sweetserver.onrender.com"); // Update with your server URL

const Chat = ({ roomId, onLogout }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Retrieve username from local storage
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) setUsername(savedUsername);
  }, []);

  // Handle socket events
  useEffect(() => {
    socket.emit("joinRoom", roomId);

    const handlePreviousMessages = (previousMessages) =>
      setMessages(previousMessages);
    const handleReceiveMessage = (newMessage) =>
      setMessages((prevMessages) => [...prevMessages, newMessage]);

    socket.on("previousMessages", handlePreviousMessages);
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("previousMessages", handlePreviousMessages);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [roomId]);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() || imageBase64) {
      const timestamp = new Date().toISOString();
      const newMessage = { roomId, username, message, timestamp, image: imageBase64 };
      socket.emit("sendMessage", newMessage); // Emit message to server
      setMessage("");
      setImageBase64(null); // Clear image after sending
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Read as Base64
      reader.onload = () => {
        setImageBase64(reader.result)

      }; // Save Base64 string
      reader.onerror = (error) => console.error("Error reading file:", error);

    }
  };

  const openModal = (image) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalImage(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    sendMessage()
  }, [imageBase64])
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h4 style={{ margin: 0 }}>Chat Room: {roomId}</h4>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="message"
            style={{
              justifyContent: msg.username === username ? "flex-end" : "flex-start",
            }}
          >
            <p
              className="message-username"
              style={{
                alignSelf: msg.username === username ? "flex-end" : "flex-start",
              }}
            >
              {msg.username}
            </p>

            <div
              className={`message-content ${msg.username === username ? "user-message" : "other-message"
                }`}
            >
              {msg.message && <p>{msg.message}</p>}
              {msg.image && (
                <img
                  src={msg.image} // Assumes the full Base64 string
                  alt="Shared"
                  className="shared-image"
                  onClick={() => openModal(msg.image)} // Open modal on click
                  style={{ cursor: "pointer" }}
                />
              )}
              <small className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll anchor */}
      </div>

      <div className="chat-footer">
        <textarea
          ref={messageInputRef}
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          rows={1}
        />
        {/* File upload button */}
        <label htmlFor="file-upload" className="image-upload-icon">
          <FaImage size={24} />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }} // Hide the input
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>

      {/* Modal for viewing image */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Modal View" className="modal-image" />
            <button className="modal-close" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
