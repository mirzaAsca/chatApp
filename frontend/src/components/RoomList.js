// RoomList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UseAuth from "../hooks/UseAuth";
import { Link } from "react-router-dom";



const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [editRoomName, setEditRoomName] = useState("");
  const navigate = useNavigate();
  const { user } = UseAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      const fetchRooms = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/rooms", {
            withCredentials: true,
          });
          setRooms(res.data.rooms);
        } catch (err) {
          console.error(err);
        }
      };

      fetchRooms();
    }
  }, [user, navigate]);

  const joinRoom = async (roomId) => {
    
    try {
      await axios.post(
        `http://localhost:5000/api/rooms/join/${roomId}`,
        {},
        { withCredentials: true }
      );
      navigate(`/rooms/${roomId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const leaveRoom = async (roomId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/rooms/leave/${roomId}`,
        {},
        { withCredentials: true }
      );
      navigate(`/rooms`);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        withCredentials: true,
      });
      const updatedRooms = rooms.filter((room) => room.id !== roomId);
      setRooms(updatedRooms);
    } catch (err) {
      console.error(err);
    }
  };

  const editRoom = async (roomId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/rooms/${roomId}`,
        { newName: editRoomName },
        { withCredentials: true }
      );
      const updatedRooms = rooms.map((room) => {
        if (room.id === roomId) {
          room.name = editRoomName;
        }
        return room;
      });
      setRooms(updatedRooms);
      setEditRoomName("");
    } catch (err) {
      console.error(err);
    }
  };
  

  return user ? (
    <div>
      <h2>Chat Rooms</h2>
      {rooms.map((room) => (
        <div key={room.id}>
          <h3>
          <Link to={`/rooms/${room.id}`}>Go to room</Link>
          </h3>
          <button onClick={() => joinRoom(room.id)}>Join Room</button>
          <button onClick={() => leaveRoom(room.id)}>Leave Room</button>
          <button onClick={() => deleteRoom(room.id)}>Delete Room</button>
          <input
            type="text"
            value={editRoomName}
            onChange={(e) => setEditRoomName(e.target.value)}
            placeholder="New Room Name"
          />
          <button onClick={() => editRoom(room.id)}>Edit Room Name</button>
        </div>
      ))}
    </div>
  ) : null;
};

export default RoomList;
