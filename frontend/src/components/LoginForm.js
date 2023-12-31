// Import the necessary modules.
import React, { useState, useContext } from "react"; // React and its hooks.
import axios from "axios"; // Axios to make HTTP requests.
import { useNavigate, Link } from "react-router-dom"; // Navigation hook from react-router.
import { AuthContext } from "../contexts/AuthContext"; // Auth context to handle authentication.
import "./LoginRegister.css"; // CSS for styling.

const API_BASE_URL = process.env.REACT_APP_API_URL;

// LoginForm component definition.
const LoginForm = () => {
  // State variables for username and password.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Fetch login function from auth context.
  const { login } = useContext(AuthContext);

  // Fetch navigate function from router.
  const navigate = useNavigate();

  // Form submission handler.
  const handleSubmit = async (e) => {
    // Prevent default form submission behavior.
    e.preventDefault();

    console.log(`Sending login request for user: ${username}`); // Log when the login request is sent

    try {
      // Make a POST request to the login API endpoint with the username and password.
      const response = await axios.post(
        `${API_BASE_URL}/api/users/login`,
        { username, password },
        { withCredentials: true }
      );

      // If successful, call the login function from the auth context with the returned username and navigate to the rooms route.
      login(response.data.username);
      navigate("/rooms");
    } catch (error) {
      // Log any errors to the console.
      console.error(error);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
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
      <div className="form-footer">
        Don't have an account? Click to <Link to="/register">Register!</Link>
      </div>
    </form>
  );
  
};

export default LoginForm;
