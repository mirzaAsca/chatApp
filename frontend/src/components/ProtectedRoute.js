// Import necessary libraries and modules
import React from 'react';
import { Route, useNavigate } from 'react-router-dom';
import UseAuth from '../hooks/UseAuth';

// Define the ProtectedRoute component
const ProtectedRoute = ({ component: Component, ...rest }) => {
  // Get the authenticated user from the UseAuth hook
  const { user } = UseAuth();
  // Get the navigate function from react-router-dom
  const navigate = useNavigate();

  // Render the Route with custom element based on user authentication
  return (
    <Route
      {...rest}
      element={
        // If the user is authenticated, render the component
        user ? <Component /> : (
          // If the user is not authenticated, navigate to '/login' and render nothing (null)
          navigate('/login'), null
        )
      }
    />
  );
};

export default ProtectedRoute;
