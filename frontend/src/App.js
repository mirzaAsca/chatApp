// App.js
import { useLocation } from "react-router-dom";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./components/Home";

import UseAuth from "./hooks/UseAuth";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ChatRoom from "./components/ChatRoom";
import RoomList from "./components/RoomList";
import CreateRoom from "./components/CreateRoom";
import ProtectedChatRoom from "./components/ProtectedChatRoom";
import LogoutButton from "./components/LogoutButton";

const MainApp = () => {
  const auth = UseAuth();
  const user = auth ? auth.user : null; // Set user to null if auth is undefined
  const location = useLocation();

  return (
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
            <Route
              path="/rooms"
              element={
                <>
                  <RoomList />
                  <CreateRoom />
                </>
              }
            />
          </>
        )}
        {user && <Route path="/" element={<Home />} />}
      </Routes>
    </div>
  );
};

export default MainApp;
