import React from 'react';
import { Route, useNavigate } from 'react-router-dom';
import UseAuth from '../hooks/UseAuth';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { user } = UseAuth();
  const navigate = useNavigate();

  return (
    <Route
      {...rest}
      element={
        user ? <Component /> : (navigate('/login'), null)
      }
    />
  );
};

export default ProtectedRoute;
