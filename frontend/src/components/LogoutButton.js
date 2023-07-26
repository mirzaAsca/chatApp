// LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UseAuth from '../hooks/UseAuth';
import io from 'socket.io-client';  // Import socket.io-client

function LogoutButton() {
  const navigate = useNavigate();
  const { setUser } = UseAuth();
  const socket = io('http://localhost:5000');  // Create a socket instance

  const logout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
  
      setUser(null);

      // Emit logout event
      socket.emit('logout', response.data.username);  // Replace 'response.data.username' with the correct username
  
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <button onClick={logout}>Logout</button>
  );
}

export default LogoutButton;