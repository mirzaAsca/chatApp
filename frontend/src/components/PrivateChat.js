import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

let socket;

const PrivateChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { chatId: encodedChatId } = useParams();
  const chatId = decodeURIComponent(encodedChatId); // Decode the chatId from URL parameters
  console.log('Decoded chatId:', chatId); // Add this line

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
        
        console.log('Computed messageChatId:', messageChatId); // Add this line
        console.log(`user.username: ${user.username}`);
        console.log(`receiverUsername: ${receiverUsername}`);
        console.log(`messageChatId: ${messageChatId}`);

        const res = await axios.get(
          `http://localhost:5000/api/chat/privateMessages/${messageChatId}`,
          { withCredentials: true }
        );

        // Adding the isUserSender property to each message
        setMessages(
          res.data.messages.map((message) => {
            return {
              ...message,
              isUserSender: message.sender === user.username,
            };
          })
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    socket.on("privateMessage", (message) => {
      console.log(`Received privateMessage event: ${JSON.stringify(message)}`);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          isUserSender: message.sender === user.username,
        },
      ]);
    });

    return () => {
      socket.off("privateMessage");
      socket.emit("logout", user.id);
      socket.close();
    };
  }, [chatId, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const receiverUsername = chatId.split('-').find(username => username !== user.username);
      const messageChatId = [user.username, receiverUsername].sort().join('-');
    
      const message = {
        text: newMessage,
        chatId: messageChatId,
        sender: user.username,
        receiver: receiverUsername,
        timestamp: Date.now(),
        isUserSender: true
      };
        
      console.log(`emit sendPrivateMessage with message: ${JSON.stringify(message)}`);
      socket.emit("sendPrivateMessage", message);
        
      console.log(`Sent message to server: ${JSON.stringify(message)}`);
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <div>
      <h2>
        Chat with:{" "}
        {chatId.split("-").find((username) => username !== user.username)}
      </h2>

      {messages.map((message, index) => {
        console.log("Message object:", message); // Log the message object
        return (
          <div key={index}>
            <p>{message.text}</p>
            <p>
              By: {message.sender === user.username ? "You" : message.sender}
            </p>
          </div>
        );
      })}

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

export default PrivateChat;
