import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams, Link } from "react-router-dom";

let socket;
const ChatRoom = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({}); // added this line to keep track of online users
  const { roomId } = useParams();

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      socket.emit("joinRoom", roomId, user.username); // added username parameter
    });

    const fetchMessages = async () => {
      if (roomId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/chat/messages/${roomId}`,
            { withCredentials: true }
          );
          setMessages(
            res.data.messages
              .map((message) => {
                return {
                  ...message,
                  isUserSender: message.sender === user.username,
                };
              })
              .reverse() // Add this line
          );
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

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          isUserSender: message.sender === user.username,
        },
      ]);
    });

    // New code for handling userOnline and userOffline events
    socket.on("userOnline", (username) => {
      setOnlineUsers((prevUsers) => ({ ...prevUsers, [username]: true }));
    });

    socket.on("userOffline", (username) => {
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
      const message = {
        text: newMessage,
        roomId: roomId, // roomId is used instead of chatId
        sender: user.username,
        timestamp: Date.now(),
        isUserSender: true,
      };

      console.log(`emit sendMessage with message: ${JSON.stringify(message)}`);
      socket.emit("sendMessage", message);

      console.log(`Sent message to server: ${JSON.stringify(message)}`);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  function customEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/%40/g, "@");
  }

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <h3>Members:</h3>
      <ul>
        {members.map((member, index) => (
          <li key={index}>
            <Link
              to={`/private/${customEncodeURIComponent(
                [user.username, member].sort().join("-")
              )}`}
            >
              {member}
            </Link>

            {onlineUsers[member] ? (
              <span style={{ color: "green" }}>◉</span>
            ) : (
              <span style={{ color: "red" }}>◉</span>
            )}
          </li>
        ))}
      </ul>
      {messages.map((message, index) => (
        <div key={index}>
          <p>{message.text}</p>
          <p>By: {message.sender === user.username ? "You" : message.sender}</p>
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
