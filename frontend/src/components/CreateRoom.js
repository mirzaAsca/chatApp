// Importing required modules and context
import React, { useContext, useState } from 'react';
import axios from 'axios';
import { RoomsContext } from '../contexts/RoomsContext';
import "./CreateRoom.css";


const API_BASE_URL = process.env.REACT_APP_API_URL;


const CreateRoom = () => {
  // Using React's useState hook to manage roomName state
  const [roomName, setRoomName] = useState('');
  
  // Using React's useContext hook to access RoomsContext
  const { setRooms } = useContext(RoomsContext);

  // Defining a function to handle form submission
  const handleSubmit = async (event) => {
    // Preventing the default action of form submission
    event.preventDefault();

    try {
      // Making a POST request to the server to create a new room
      const response = await axios.post(`${API_BASE_URL}/api/rooms/create`, 
      { name: roomName }, // Sending roomName as part of the request body
        { withCredentials: true } // Sending cookies along with the request
      );

      // Logging the response data
      console.log(response.data);

      // Fetching rooms again after creating a new room
      const roomsResponse = await axios.get(`${API_BASE_URL}/api/rooms`, { withCredentials: true });
      
      // Updating the rooms state
      setRooms(roomsResponse.data.rooms);

      // Clearing the roomName input field after successful creation
      setRoomName('');
    } catch (error) {
      // Logging the error in case room creation fails
      console.error('Failed to create room:', error);
    }
  };

  // Rendering the form
  return (
    <form className="create-room-form" onSubmit={handleSubmit}>
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

// Exporting CreateRoom component
export default CreateRoom;
