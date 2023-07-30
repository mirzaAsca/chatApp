import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams, Link } from "react-router-dom";
import '../App.css';

let socket;
const ChatRoom = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [members, setMembers] = useState([]);
  const { roomId } = useParams();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      socket.emit("joinRoom", roomId, user.username);
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
                  alignment: message.sender === user.username ? "align-right" : "align-left",
                  name: message.sender,
                  time: new Date(message.timestamp).toLocaleTimeString(),
                  id: message._id,
                  meOrNot: message.sender === user.username ? "me" : "not-me",
                  otherOrMy: message.sender === user.username ? "my" : "other",
                };
              })
              .reverse()
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
          alignment: message.sender === user.username ? "align-right" : "align-left",
          name: message.sender,
          time: new Date(message.timestamp).toLocaleTimeString(),
          id: message._id,
          meOrNot: message.sender === user.username ? "me" : "not-me",
          otherOrMy: message.sender === user.username ? "my" : "other",
        },
      ]);
    });

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

    if (newMessage.trim() !== "") {
      try {
        const message = {
          text: newMessage,
          roomId: roomId,
          sender: user.username,
          timestamp: Date.now(),
          isUserSender: true,
        };

        socket.emit("sendMessage", message);
        setNewMessage("");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!e.shiftKey) {
        sendMessage(e);
      }
    }
  }

  return (
    <div className="chat">
      <div className="chat-header clearfix">
        <div className="online-users">
          <ul>
            {members.map((member, index) => (
              <li key={index}>
                <Link to={`/private/${member}`}>
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
        </div>

        <div className="chat-about">
          <div className="chat-with">Chat with {roomId}</div>
        </div>
      </div>

      <div className="chat-history">
        <ul>
          {messages.map((message) => (
            <li className="clearfix" key={message.id}>
              <div className={`message-data ${message.alignment}`}>
              <span className="message-data-name">{message.isUserSender ? 'You' : message.sender}</span>                <i className={`fa fa-circle ${message.meOrNot}`}></i>
              </div>
              <div className={`message ${message.otherOrMy}-message float-right`}>
                {message.text}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-message clearfix">
        <form onSubmit={sendMessage}>
          <textarea
            name="message-to-send"
            id="message-to-send"
            placeholder="Type your message"
            rows="1"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
