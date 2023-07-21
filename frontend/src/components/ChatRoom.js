// ChatRoom.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';


const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { roomId } = useParams();
  const socket = io();

  useEffect(() => {
    const fetchMessages = async () => {
      if (roomId) {
        try {
          const res = await axios.get(`/api/chat?roomId=${roomId}`);
          setMessages(res.data.messages);
        } catch (err) {
          console.error(err);
        }
      } else {
        console.error('roomId is undefined');
      }
    };
  
    fetchMessages();

    socket.on('receiveMessage', (message) => {
      setMessages((oldMessages) => [...oldMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [roomId, socket]);

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/chat', { text: newMessage, roomId });
      setNewMessage('');
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
