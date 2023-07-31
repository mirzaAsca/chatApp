// Required Libraries
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "../App.css";

let socket;

// ChatRoom component
const ChatRoom = ({ user, roomId, roomName, members = [], setMembers }) => {

  // Initializing states
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);

  // Function for smooth scrolling to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages update
  useEffect(scrollToBottom, [messages]);

  // When roomId or username changes, create a new socket connection and fetch initial messages and members
  useEffect(() => {

    // Initialize socket connection
    socket = io("http://localhost:5000");

    // On connection, join the room with username
    socket.on("connect", () => {
      socket.emit("joinRoom", roomId, user.username);
    });

    // Fetch all messages for the room
    const fetchMessages = async () => {
      if (roomId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/chat/messages/${roomId}`, { withCredentials: true });
          setMessages(res.data.messages.map((message) => {
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
          }).reverse());
        } catch (err) {
          console.error(err);
        }
      }
    };

    // Fetch all members for the room
    const fetchRoomMembers = async () => {
      if (roomId) {
        try {
          const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}/members`, { withCredentials: true });
          setMembers(res.data.members);
        } catch (err) {
          console.error(err);
        }
      }
    };

    // Fetch initial data
    fetchMessages();
    fetchRoomMembers();

    // Socket events handlers
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, {
        ...message,
        isUserSender: message.sender === user.username,
        alignment: message.sender === user.username ? "align-right" : "align-left",
        name: message.sender,
        time: new Date(message.timestamp).toLocaleTimeString(),
        id: message._id,
        meOrNot: message.sender === user.username ? "me" : "not-me",
        otherOrMy: message.sender === user.username ? "my" : "other",
      }]);
    });

    socket.on("userOnline", (username) => {
      setOnlineUsers((prevUsers) => ({ ...prevUsers, [username]: true }));
    });

    socket.on("userOffline", (username) => {
      setOnlineUsers((prevUsers) => ({ ...prevUsers, [username]: false }));
    });

    // Cleanup function when the component unmounts or roomId/username changes
    return () => {
      socket.off("receiveMessage");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [roomId, user.username]);

  // Function to send a message
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

  // Handlers for input change and keydown events
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!e.shiftKey) {
        sendMessage(e);
      }
    }
  };

  // Rendering chat component
  return (
    <div className="chat">
      <div className="chat-header clearfix">
        <div className="chat-about">
          <div className="chat-with">Room: {roomName}</div>
        </div>
      </div>

      <div className="chat-history">
        <ul>
          {messages.map((message) => (
            <li className="clearfix" key={message.id}>
              <div className={`message-data ${message.alignment}`}>
                <span className="message-data-name">
                  {message.isUserSender ? "You" : message.sender}
                </span>{" "}
                <i className={`fa fa-circle ${message.meOrNot}`}></i>
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
