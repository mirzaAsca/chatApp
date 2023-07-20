import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext); // Import AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/login', 
        { username, password }, 
        { withCredentials: true }  // Include cookies in the request
      );
      console.log(response.data);
  
      // Set the user in the context
      setUser({ username });
  
      // Redirect the user to the chat room
      navigate('/chat');
    } catch (error) {
      console.error('Failed to login', error);
  
      // Show an error message
      alert('Failed to login. Please check your username and password.');
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
