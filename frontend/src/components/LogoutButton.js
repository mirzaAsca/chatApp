// LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

function LogoutButton() {
  const navigate = useNavigate();
  const { logout, user } = React.useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
  
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default LogoutButton;
