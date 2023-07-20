import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UseAuth from '../hooks/UseAuth';

function LogoutButton() {
  const navigate = useNavigate();
  const { setUser } = UseAuth();

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
  
      setUser(null);
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
