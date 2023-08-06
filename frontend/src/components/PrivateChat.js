import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import "./ChatRoom.css";
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Create a socket instance
let socket;

// PrivateChat component definition
const PrivateChat = ({ user }) => {
  // State for storing messages and the input value for sending messages
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Extract the chatId parameter from the URL
  const { chatId: encodedChatId } = useParams();
  const chatId = decodeURIComponent(encodedChatId);

  // Create refs for the input and chat container elements
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Effect to scroll to the bottom of the chat container when new messages are received
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Effect to initialize the socket connection and fetch existing messages
  useEffect(() => {
    // Initialize socket connection
    socket = io(API_BASE_URL);

    // Handle socket connection and login event
    socket.on("connect", () => {
      console.log(`Socket connected with ID: ${socket.id}`);
      socket.emit("login", user.id);
    });

    // Function to fetch existing private messages for the chat
    const fetchMessages = async () => {
      try {
        console.log(`Fetching messages for chatId: ${chatId}`);
        const receiverUsername = chatId
          .split("-")
          .find((username) => username !== user.username);
        const messageChatId = [user.username, receiverUsername]
          .sort()
          .join("-");

        // Fetch messages from the server
        const res = await axios.get(
          `${API_BASE_URL}/api/chat/privateMessages/${messageChatId}`,
          { withCredentials: true }
        );

        // Add the isUserSender property to each message and reverse the order for displaying
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

    // Fetch existing messages for the chat
    fetchMessages();

    // Listen for new private messages from the server
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

        // Scroll to the bottom after receiving a new message
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    });

    // Cleanup function to remove socket listeners and close the socket connection
    return () => {
      socket.off("privateMessage");
      socket.off("updateMessageStatus");
      socket.emit("logout", user.id);
      socket.close();
    };
  }, [chatId, user]);

  // Function to send a private message
  const sendMessage = async (e) => {
    e.preventDefault();

    // Get the receiver's username and create the chatId for the message
    const receiverUsername = chatId
      .split("-")
      .find((username) => username !== user.username);
    const messageChatId = [user.username, receiverUsername].sort().join("-");

    // Create the message object
    const message = {
      text: inputValue,
      chatId: messageChatId,
      sender: user.username,
      receiver: receiverUsername,
      timestamp: Date.now(),
      isUserSender: true,
      status: "sent",
    };

    // Emit the "sendPrivateMessage" event with the message data
    socket.emit("sendPrivateMessage", message);

    // Clear the input field after sending the message
    setInputValue("");
  };

  // Function to handle changes in the input field
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // JSX to render the PrivateChat component
  return (
    <div className="chat">
      <div className="chat-header clearfix">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg"
          alt="avatar"
        />

        <div className="chat-about">
          <div className="chat-with">
            Chat with{" "}
            {chatId.split("-").find((username) => username !== user.username)}
          </div>
          <div className="chat-num-messages">
            already {messages.length} messages
          </div>
        </div>
        <i className="fa fa-star"></i>
      </div>

      <div className="chat-history" ref={chatContainerRef}>
        <ul>
          {messages.map((message, index) => (
            <li className="clearfix" key={index}>
              <div
                className={`message-data ${
                  message.isUserSender ? "align-right" : "align-left"
                }`}
              >
                <span className="message-data-name">
                  {message.isUserSender ? "You" : message.sender}
                </span>
                <span className="message-data-status">
                  Status: {message.status || "sent"}
                </span>
                <i
                  className={`fa fa-circle ${message.isUserSender ? "me" : ""}`}
                ></i>
              </div>
              <div
                className={`message ${
                  message.isUserSender ? "my" : "other"
                }-message float-right`}
              >
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
              if (e.key === "Enter" && !e.shiftKey) {
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
