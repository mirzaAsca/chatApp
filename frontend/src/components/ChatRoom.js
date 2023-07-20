import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
const socket = io();

function ChatRoom() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = io();

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat/messages',{ withCredentials: true });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.on('receiveMessage', (message) => {
      setMessages((messages) => [...messages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    socket.emit('sendMessage', { text: message });
    setMessage('');
  };

  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.text}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;
