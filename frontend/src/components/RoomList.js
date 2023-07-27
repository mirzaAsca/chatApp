// RoomList.js
import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UseAuth from "../hooks/UseAuth";
import { Link } from "react-router-dom";
import { RoomsContext } from '../contexts/RoomsContext';

const RoomList = () => {
  const { rooms, setRooms } = useContext(RoomsContext);

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
          console.log(res.data.rooms); // Add this line
          setRooms(res.data.rooms);
          console.log('Rooms in RoomList after setting:', rooms); // Add this line
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchRooms();
    }
  }, [user, navigate]);

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        withCredentials: true,
      });
      // Refresh room list after deletion
      const res = await axios.get("http://localhost:5000/api/rooms", {
        withCredentials: true,
      });
      setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
    }
  };

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

  return user ? (
    <div>
      <h2>Chat Rooms</h2>
      {rooms.map((room) => (
        <div key={room.id}>
          <h3>
            <Link to={`/rooms/${room.id}`}>{room.name}</Link>
            {room.members.map(
              (member, index) =>
                member !== user.username && (
                  <Link
                    key={index}
                    to={`/private/${[user.username, member].sort().join("-")}`}
                  >
                    Private Chat with {member}
                  </Link>
                )
            )}
          </h3>
          <button onClick={() => joinRoom(room.id)}>Join Room</button>
          <button onClick={() => leaveRoom(room.id)}>Leave Room</button>
          <button onClick={() => deleteRoom(room.id)}>Delete Room</button>
        </div>
      ))}
    </div>
  ) : null;
};

export default RoomList;
