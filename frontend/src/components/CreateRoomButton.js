import React, { useState } from "react";
import axios from "axios";

const CreateRoomButton = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Make a POST request to your server to create the room.
      // You'll need to replace this with your actual API call.
      await axios.post("/api/rooms/create", { name: roomName });

      // Close the form and clear the room name after successful creation.
      setIsFormOpen(false);
      setRoomName("");
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <div>
      <button onClick={handleOpenForm}>Create Room</button>

      {isFormOpen && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={roomName}
            onChange={handleRoomNameChange}
            placeholder="Room name"
            required
          />
          <button type="submit">Create</button>
        </form>
      )}
    </div>
  );
};

export default CreateRoomButton;
