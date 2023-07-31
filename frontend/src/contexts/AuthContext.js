// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State to store user information
  const [user, setUser] = useState(null);
  
  // State to store the socket connection
  const [socket, setSocket] = useState(null);

  // Function to create a socket connection when the user logs in
  const login = (username) => {
    setUser({ username });

    // Establish a new socket connection to the server
    const newSocket = io('http://localhost:5000');

    // Emit a 'login' event to the server with the username
    newSocket.emit('login', username);

    // Save the new socket connection in the state
    setSocket(newSocket);
  };

  // Function to disconnect the socket and clear the user information when the user logs out
  const logout = () => {
    setUser(null);

    if (socket) {
      // Emit a 'logout' event to the server with the current username
      socket.emit('logout', user.username);

      // Disconnect the socket
      socket.disconnect();
    }

    // Clear the socket from the state
    setSocket(null);
  };

  // Cleanup the socket connection on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        // Disconnect the socket if it exists when the component is unmounted
        socket.disconnect();
      }
    };
  }, [socket]);

  // Provide the user, login, and logout functions to the children components
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
