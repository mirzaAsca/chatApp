// LoginForm.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import io from 'socket.io-client'; // Import socket.io-client

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext); // Ensure AuthContext provides setUser
  const navigate = useNavigate();
  const socket = io('http://localhost:5000'); // Create a socket instance

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/login',
        { username, password },
        { withCredentials: true }
      );

      setUser({ username: response.data.username }); // Ensure response.data contains username

      // Emit login event
      socket.emit('login', response.data.username);

      navigate('/rooms');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Log in</button>
    </form>
  );
};

export default LoginForm;