// Importing necessary libraries and hooks
import React from 'react';
import { useNavigate } from 'react-router-dom';  // React Router's hook for navigation
import axios from 'axios';  // HTTP client for the browser and node.js
import { AuthContext } from '../contexts/AuthContext';  // Context for Auth
import '../App.css';  // CSS for styling
const API_BASE_URL = process.env.REACT_APP_API_URL;


// The LogoutButton component
function LogoutButton() {
  // useNavigate hook for navigation
  const navigate = useNavigate();

  // useContext hook to access the AuthContext
  const { logout } = React.useContext(AuthContext);

  // Function for handling the logout
  const handleLogout = async () => {
    try {
      // Making a POST request to the logout API
      await axios.post(
        `${API_BASE_URL}/api/users/logout`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Access token for authentication
          },
          withCredentials: true // Enables automatic sending of cookies
        }
      );
  
      // Calling the logout method from AuthContext
      logout();

      // Navigating to the login page after successful logout
      navigate('/login');
    } catch (error) {
      // Logging any error occurred during the process
      console.error('Failed to log out', error);
    }
  };
  
  // Rendering the Logout button
  return (
    <button className='logout-button' onClick={handleLogout}>Logout</button>
  );
}

export default LogoutButton;
