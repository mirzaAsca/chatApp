// App.js
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./components/Home";
import { AuthContext } from "./contexts/AuthContext";
import { RoomsContext } from "./contexts/RoomsContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import RoomList from "./components/RoomList";
import CreateRoom from "./components/CreateRoom";
import LogoutButton from "./components/LogoutButton";
import PrivateChat from "./components/PrivateChat";
import "./App.css";

const MainApp = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Initialize rooms as an empty array
  const [rooms, setRooms] = useState([]);

  // Determine whether the navbar should be hidden for the current route
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <RoomsContext.Provider value={{ rooms, setRooms }}>
      <div className="App">
        {!hideNavbar && (
          <div className="navbar">
            <div className="navbar-left">
              {user && <p>Welcome, {user.username}!</p>}
              {user && <LogoutButton className="logout-button" />}
            </div>
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
          </div>
        )}

<Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      {user ? (
        <>
          <Route
            path="/private/:chatId"
            element={<PrivateChat user={user} />}
          />

          <Route
            path="/rooms"
            element={
              <>
                <CreateRoom user={user} />
                <RoomList user={user} />
              </>
            }
          />
          <Route path="/" element={<Home />} />
        </>
      ) : (
        <Route path="/" element={<Navigate to="/login" />} /> // Redirect to login if user is not present
      )}
    </Routes>
      </div>
    </RoomsContext.Provider>
  );
};

export default MainApp;
