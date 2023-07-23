// ChatRoom.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

// Create socket object outside of the ChatRoom component
let socket;

const ChatRoom = ({ user }) => {  // Receive the user object as a prop
  console.log("User in ChatRoom:", user);  // Add this line
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { roomId } = useParams();

  useEffect(() => {
    // Connect to the socket
    socket = io('http://localhost:5000');
  
    socket.on('connect', () => {
      socket.emit('joinRoom', roomId);
      console.log('Socket connected:', socket.connected);
    });

    const fetchMessages = async () => {
      if (roomId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/chat/messages/${roomId}`,
            { withCredentials: true }
          );
          console.log("Fetched messages:", res.data.messages); // Add this line
          setMessages(res.data.messages);
        } catch (err) {
          console.error(err);
        }
      } else {
        console.error("roomId is undefined");
      }
    };
    

    fetchMessages();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.connected);  // Added log
    });

    socket.on('receiveMessage', (message) => {
      console.log("Received message:", message);  // Added log
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId]); // Removed socket from dependency array

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const message = { text: newMessage, roomId, sender: user.username }; // use user.username here
      socket.emit('sendMessage', message);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div>
      <h2>Room: {roomId}</h2>
      {messages.map((message, index) => (
        <div key={index}>
          <p>{message.text}</p>
          <p>By: {message.sender}</p>
        </div>
      ))}
      <form onSubmit={sendMessage}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
