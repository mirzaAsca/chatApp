import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

let socket;

const PrivateChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { chatId: encodedChatId } = useParams();
  const chatId = decodeURIComponent(encodedChatId);
  const inputRef = useRef(null);

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
    socket.on("updateMessageStatus", ({ messageId, status }) => {
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (message.id === messageId) {
            return { ...message, status };
          }
          return message;
        });
      });
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
    try {
      const receiverUsername = chatId
        .split("-")
        .find((username) => username !== user.username);
      const messageChatId = [user.username, receiverUsername].sort().join("-");

      const message = {
        text: newMessage,
        chatId: messageChatId,
        sender: user.username,
        receiver: receiverUsername,
        timestamp: Date.now(),
        isUserSender: true,
        status: "sent", // Add status here
      };

      console.log(
        `emit sendPrivateMessage with message: ${JSON.stringify(message)}`
      );
      socket.emit("sendPrivateMessage", message);

      console.log(`Sent message to server: ${JSON.stringify(message)}`);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      // Update the status of all received messages to 'read'
      const receivedMessages = messages.filter(
        (message) =>
          message.isUserSender === false && message.status === "delivered"
      );
      receivedMessages.forEach((message) => {
        socket.emit("updateMessageStatus", {
          messageId: message.id,
          status: "read",
        });
      });
    };
    

    // Add the focus event listener to the input field
    const inputField = inputRef.current;
    if (inputField) {
      inputField.addEventListener("focus", handleFocus);

      return () => {
        inputField.removeEventListener("focus", handleFocus);
      };
    }
  }, [messages, socket]);

  return (
    <div>
      <h2>
        Chat with:{" "}
        {chatId.split("-").find((username) => username !== user.username)}
      </h2>

      {messages.map((message, index) => {
        return (
          <div key={index}>
            <p>{message.text}</p>
            <p>
              By: {message.sender === user.username ? "You" : message.sender}
            </p>
            {message.isUserSender && <p>Status: {message.status || "sent"}</p>}
          </div>
        );
      })}

      <form onSubmit={sendMessage}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onClick={() => {
            // Get the last delivered message sent by the current user
            const lastDeliveredMessage = messages.find(
              (message) =>
                message.isUserSender === true && message.status === "delivered"
            );
            if (lastDeliveredMessage) {
              // Emit an event to the server to update the status to 'read'
              socket.emit("updateMessageStatus", {
                messageId: lastDeliveredMessage.id,
                status: "read",
              });
            }
          }}
          placeholder="Send a message"
          id="message-input"
        />

        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default PrivateChat;