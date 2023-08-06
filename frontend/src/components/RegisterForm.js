// Importing necessary libraries
import React, { useState } from 'react';
import axios from 'axios';
import "./LoginRegister.css"; // CSS for styling.
import { Link } from 'react-router-dom'; // Import Link from react-router-dom


const API_BASE_URL = process.env.REACT_APP_API_URL;


// Defining the RegisterForm component
function RegisterForm() {
  // State variables for username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    try {
      // Sending a POST request to the server to register the user
      await axios.post(`${API_BASE_URL}/api/users/register`, { username, password }, {
        withCredentials: true // Include credentials (like cookies) with the request
      });
      
      alert('Registered successfully'); // Show an alert when registration is successful
    } catch (error) {
      // If there's an error, log the error response data to the console
      console.error('Failed to register', error.response.data);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Register</button>
      <div className="form-footer">
        Already have an account? Click to <Link to="/login">Log in!</Link>
      </div>
    </form>
  );
  
}

export default RegisterForm; // Exporting the RegisterForm component for use in other files
