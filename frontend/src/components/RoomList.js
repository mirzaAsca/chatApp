// RoomList.js
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UseAuth from "../hooks/UseAuth";
import { Link } from "react-router-dom";
import { RoomsContext } from "../contexts/RoomsContext";
import { ReactComponent as DeleteIcon } from "./media/delete.svg";
import { ReactComponent as LeaveIcon } from "./media/leave.svg";
import { ReactComponent as CorrectIcon } from "./media/correct.svg";
import ChatRoom from "./ChatRoom";

const RoomList = () => {
  // Get the rooms data from the RoomsContext
  const { rooms, setRooms } = useContext(RoomsContext);

  // Initialize hooks and states
  const navigate = useNavigate();
  const { user } = UseAuth();
  const [selectedRoomMembers, setSelectedRoomMembers] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [chatRoomMembers, setChatRoomMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [members, setMembers] = useState([]);

  // Fetch the list of rooms from the server on component mount
  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login page if user is not logged in
    } else {
      const fetchRooms = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/rooms", {
            withCredentials: true, // Send credentials along with the request
          });
          setRooms(res.data.rooms); // Update the state with fetched rooms data
        } catch (err) {
          console.error(err);
        }
      };

      fetchRooms();
    }
  }, [user, navigate]);

  // Function to delete a room by its ID
  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        withCredentials: true, // Send credentials along with the request
      });
      const res = await axios.get("http://localhost:5000/api/rooms", {
        withCredentials: true, // Send credentials along with the request
      });
      setRooms(res.data.rooms); // Update the state with updated rooms data after deletion
    } catch (err) {
      console.error(err);
    }
  };

  // Function to join a room by its ID
  const joinRoom = async (roomId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/rooms/join/${roomId}`,
        {},
        { withCredentials: true } // Send credentials along with the request
      );
      // Update the rooms state by adding the current user to the joined room's members list
      setRooms((prevRooms) => {
        return prevRooms.map((room) => {
          if (room.id === roomId) {
            return {
              ...room,
              members: [...room.members, user.username],
            };
          } else {
            return room;
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Function to leave a room by its ID
  const leaveRoom = async (roomId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/rooms/leave/${roomId}`,
        {},
        { withCredentials: true } // Send credentials along with the request
      );
      // Update the rooms state by removing the current user from the left room's members list
      setRooms((prevRooms) => {
        return prevRooms.map((room) => {
          if (room.id === roomId) {
            return {
              ...room,
              members: room.members.filter((member) => member !== user.username),
            };
          } else {
            return room;
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle click on a room, set the selected room's members and ID
  const handleRoomClick = (members, roomId) => {
    setSelectedRoomMembers(members);
    setSelectedRoomId(roomId);
  };

  return (
    <div className="room-user-list-container">
      <div className="room-list">
        <h2>Chat Rooms</h2>
        {rooms.map((room) => (
          <div key={room.id}>
            <h3
              className="room-name"
              onClick={() => handleRoomClick(room.members, room.id)}
            >
              {room.name}
            </h3>
            <div className="room-buttons">
              {room.members.includes(user.username) ? (
                <button disabled>
                  <CorrectIcon />
                  Joined
                </button>
              ) : (
                <button onClick={() => joinRoom(room.id)}>Join</button>
              )}
              <button onClick={() => leaveRoom(room.id)}>
                <LeaveIcon />
              </button>
              <button onClick={() => deleteRoom(room.id)}>
                <DeleteIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedRoomId && selectedRoomMembers.includes(user.username) ? (
        <ChatRoom
          user={user}
          roomId={selectedRoomId}
          roomName={rooms.find((room) => room.id === selectedRoomId).name}
          chatRoomMembers={chatRoomMembers}
          setChatRoomMembers={setChatRoomMembers}
          setOnlineUsers={setOnlineUsers}
          setMembers={setMembers}
        />
      ) : (
        <div>You are not a member, please join the room!</div>
      )}
      <div className="user-list">
        {members.map((member, index) =>
          member !== user.username ? (
            <div key={index}>
              <Link to={`/private/${[user.username, member].sort().join("-")}`}>
                {member}
              </Link>
              {onlineUsers[member] ? (
                <span style={{ color: "green" }}>◉</span>
              ) : (
                <span style={{ color: "red" }}>◉</span>
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default RoomList;
