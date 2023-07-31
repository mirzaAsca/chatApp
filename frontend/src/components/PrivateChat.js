import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import '../App.css';

let socket;

const PrivateChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const { chatId: encodedChatId } = useParams();
  const chatId = decodeURIComponent(encodedChatId);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log(`Socket connected with ID: ${socket.id}`);
      socket.emit("login", user.id);
    });

    const fetchMessages = async () => {
      try {
        console.log(`Fetching messages for chatId: ${chatId}`);
        const receiverUsername = chatId
          .split("-")
          .find((username) => username !== user.username);
        const messageChatId = [user.username, receiverUsername]
          .sort()
          .join("-");

        // Fetch messages
        const res = await axios.get(
          `http://localhost:5000/api/chat/privateMessages/${messageChatId}`,
          { withCredentials: true }
        );

        // Adding the isUserSender property to each message and reverse the order
        setMessages(
          res.data.messages
            .map((message) => {
              return {
                ...message,
                isUserSender: message.sender === user.username,
              };
            })
            .reverse()
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    socket.on("privateMessage", (message) => {
      console.log(`Received privateMessage event: ${JSON.stringify(message)}`);
      if (message.chatId === chatId) {
        setMessages((prevMessages) => {
          return [
            ...prevMessages,
            {
              ...message,
              isUserSender: message.sender === user.username,
              status: "delivered",
            },
          ];
        });
      }
    });

    // Listen for status updates from the server
    socket.on("privateMessage", (message) => {
      console.log(`Received privateMessage event: ${JSON.stringify(message)}`);
      if (message.chatId === chatId) {
        setMessages((prevMessages) => {
          return [
            ...prevMessages,
            {
              ...message,
              isUserSender: message.sender === user.username,
              status: "delivered",
            },
          ];
        });
    
        // Scroll to bottom after receiving a new message
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });
    

    return () => {
      socket.off("privateMessage");
      socket.off("updateMessageStatus");
      socket.emit("logout", user.id);
      socket.close();
    };
  }, [chatId, user]);

  

  const sendMessage = async (e) => {
    e.preventDefault();

    const receiverUsername = chatId.split("-").find((username) => username !== user.username);
    const messageChatId = [user.username, receiverUsername].sort().join("-");

    const message = {
      text: inputValue,
      chatId: messageChatId,
      sender: user.username,
      receiver: receiverUsername,
      timestamp: Date.now(),
      isUserSender: true,
      status: "sent",
    };

    socket.emit("sendPrivateMessage", message);

    setInputValue("");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="chat">
      <div className="chat-header clearfix">
        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg" alt="avatar" />
  
        <div className="chat-about">
          <div className="chat-with">Chat with {chatId.split("-").find((username) => username !== user.username)}</div>
          <div className="chat-num-messages">already {messages.length} messages</div>
        </div>
        <i className="fa fa-star"></i>
      </div>
  
      <div className="chat-history" ref={chatContainerRef}>
        <ul>
          {messages.map((message, index) => (
            <li className="clearfix" key={index}>
              <div className={`message-data ${message.isUserSender ? 'align-right' : 'align-left'}`}>

                <span className="message-data-name">{message.isUserSender ? "You" : message.sender}</span>
                <span className="message-data-status">
                  Status: {message.status || 'sent'}
                </span>
                <i className={`fa fa-circle ${message.isUserSender ? 'me' : ''}`}></i>
              </div>
              <div className={`message ${message.isUserSender ? 'my' : 'other'}-message float-right`}>
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
  rows="3"
  value={inputValue}
  onChange={handleInputChange}
  onKeyPress={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  }}
></textarea>

          <i className="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;
          <i className="fa fa-file-image-o"></i>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default PrivateChat;