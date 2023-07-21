// CreateRoom.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UseAuth from '../hooks/UseAuth'; 
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const { user } = UseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if user is not logged in
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/rooms/create', 
        { name: roomName },
        { withCredentials: true }
      );
      console.log(response.data);
      setRoomName('');
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={roomName}
        onChange={(event) => setRoomName(event.target.value)}
        placeholder="Room name"
        required
      />
      <button type="submit">Create Room</button>
    </form>
  );
};

export default CreateRoom;
