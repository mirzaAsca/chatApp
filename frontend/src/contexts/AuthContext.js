// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  // Create socket connection when user logs in
  const login = (username) => {
    setUser({ username });

    const newSocket = io('http://localhost:5000');
    newSocket.emit('login', username);
    setSocket(newSocket);
  };

  // Disconnect socket when user logs out
  const logout = () => {
    setUser(null);

    if (socket) {
      socket.emit('logout', user.username);
      socket.disconnect();
    }
    setSocket(null);
  };

  // Cleanup socket connection on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
