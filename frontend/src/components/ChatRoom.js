// ChatRoom.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

// Create socket object outside of the ChatRoom component
const socket = io();

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { roomId } = useParams();

  useEffect(() => {
    const fetchMessages = async () => {
      if (roomId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/chat/messages/${roomId}`,
            { withCredentials: true }
          );
          setMessages(res.data.messages);
        } catch (err) {
          console.error(err);
        }
      } else {
        console.error("roomId is undefined");
      }
    };

    fetchMessages();

    socket.on("receiveMessage", (message) => {
      setMessages((oldMessages) => [...oldMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId]); // Removed socket from dependency array

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/chat/send",
        { text: newMessage, roomId },
        { withCredentials: true }
      );
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      {messages.map((message) => (
        <div key={message.id}>
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
