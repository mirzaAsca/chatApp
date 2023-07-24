import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

let socket;

const ChatRoom = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState([]);  
  const [onlineUsers, setOnlineUsers] = useState({}); // added this line to keep track of online users
  const { roomId } = useParams();

  useEffect(() => {
    socket = io('http://localhost:5000');
  
    socket.on('connect', () => {
      socket.emit('joinRoom', roomId, user.username); // added username parameter
    });

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
      }
    };

    const fetchRoomMembers = async () => {
      if (roomId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/rooms/${roomId}/members`,
            { withCredentials: true }
          );
          setMembers(res.data.members);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchMessages();
    fetchRoomMembers();

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // New code for handling userOnline and userOffline events
    socket.on('userOnline', (username) => {
      setOnlineUsers((prevUsers) => ({ ...prevUsers, [username]: true }));
    });

    socket.on('userOffline', (username) => {
      setOnlineUsers((prevUsers) => ({ ...prevUsers, [username]: false }));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [roomId, user.username]);

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const message = { text: newMessage, roomId, sender: user.username };
      socket.emit('sendMessage', message);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div>
      <h2>Room: {roomId}</h2>
      <h3>Members:</h3>  
      <ul>
        {members.map((member, index) => (
          <li key={index}>
            {member} {onlineUsers[member] ? <span style={{color: "green"}}>●</span> : <span style={{color: "red"}}>●</span>}
          </li>
        ))}
      </ul>
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
