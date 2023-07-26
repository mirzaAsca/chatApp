// ProtectedChatRoom.js
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';  // Import useParams
import UseAuth from '../hooks/UseAuth';
import ChatRoom from './ChatRoom';

const ProtectedChatRoom = () => {
  const { user } = UseAuth();  // Get the user from the Auth context
  const { roomId } = useParams();  // Get roomId from URL parameters

  // If there is no user logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a user is logged in, render the ChatRoom
  return <ChatRoom user={user} roomId={roomId} />;  // Pass user and roomId as props
};

export default ProtectedChatRoom;