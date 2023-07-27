// CreateRoom.js

import React, { useContext, useState } from 'react';
import axios from 'axios';
import { RoomsContext } from '../contexts/RoomsContext'; 

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const { setRooms } = useContext(RoomsContext);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/rooms/create', 
        { name: roomName },
        { withCredentials: true }
      );
      console.log(response.data);

      // Fetch rooms again after creating a new room
      const roomsResponse = await axios.get('http://localhost:5000/api/rooms', { withCredentials: true });
      setRooms(roomsResponse.data.rooms);

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
