// App.js
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./components/Home";

import { AuthContext } from "./contexts/AuthContext";
import { RoomsContext } from "./contexts/RoomsContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ChatRoom from "./components/ChatRoom";
import RoomList from "./components/RoomList";
import CreateRoom from "./components/CreateRoom";
import ProtectedChatRoom from "./components/ProtectedChatRoom";
import LogoutButton from "./components/LogoutButton";
import PrivateChat from "./components/PrivateChat";
import { RoomsProvider } from './contexts/RoomsContext';
import "./App.css";

const MainApp = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Initialize rooms as an empty array
  const [rooms, setRooms] = useState([]);

  return (
    <RoomsContext.Provider value={{ rooms, setRooms }}>
      <div className="App">
        {user && <p>Welcome, {user.username}!</p>}
        {user && <LogoutButton />}
        <nav>
          <ul>
            {!user && (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/">Home</Link>
                </li>
              </>
            )}
            {user && (
              <>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/rooms">Rooms</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          {user && (
            <>
              <Route path="/rooms/:roomId" element={<ProtectedChatRoom />} />
              <Route path="/private/:chatId" element={<PrivateChat user={user} />} />

              <Route
                path="/rooms"
                element={
                  <>
                    <RoomList user={user} />
                    <CreateRoom user={user} />
                  </>
                }
              />
            </>
          )}
          {user && <Route path="/" element={<Home />} />}
        </Routes>
      </div>
    </RoomsContext.Provider>
  );
};

export default MainApp;
