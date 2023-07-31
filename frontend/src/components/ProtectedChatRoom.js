// ProtectedChatRoom.js
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';  // Import the required modules
import UseAuth from '../hooks/UseAuth';  // Import the custom hook
import ChatRoom from './ChatRoom';  // Import the ChatRoom component

const ProtectedChatRoom = () => {
  const { user } = UseAuth();  // Get the user from the Auth context using the custom hook
  const { roomId } = useParams();  // Get the roomId from URL parameters using React Router's useParams hook

  // If there is no user logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a user is logged in, render the ChatRoom component passing user and roomId as props
  return <ChatRoom user={user} roomId={roomId} />;
};

export default ProtectedChatRoom;
