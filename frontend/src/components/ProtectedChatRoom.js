// ProtectedChatRoom.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import UseAuth from '../hooks/UseAuth';
import ChatRoom from './ChatRoom';

const ProtectedChatRoom = () => {
  const { user } = UseAuth();  // Get the user from the Auth context

  // If there is no user logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a user is logged in, render the ChatRoom
  return <ChatRoom />;
};

export default ProtectedChatRoom;
