// Importing necessary libraries
import React, { useState } from 'react';
import axios from 'axios';

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
      await axios.post('http://localhost:5000/api/users/register', { username, password }, {
        withCredentials: true // Include credentials (like cookies) with the request
      });
      alert('Registered successfully'); // Show an alert when registration is successful
    } catch (error) {
      // If there's an error, log the error response data to the console
      console.error('Failed to register', error.response.data);
    }
  };

  return (
    // Form for user registration, with event handler for form submission
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Register</button> {/* Submit button for form submission */}
    </form>
  );
}

export default RegisterForm; // Exporting the RegisterForm component for use in other files
