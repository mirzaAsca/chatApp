// App.js
import React from "react";
import { Route, Routes, Link, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import UseAuth from "./hooks/UseAuth";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ChatRoom from "./components/ChatRoom";
import LogoutButton from "./components/LogoutButton.js";

const ProtectedChatRoom = () => {
  const { user } = UseAuth();

  // Redirect to login if user is not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is logged in, render the chat room
  return <ChatRoom />;
};

const MainApp = () => {
  const { user } = UseAuth();

  return (
    <div className="App">
      {user && <p>Welcome, {user.username}!</p>}
      {user && <LogoutButton />}
      <nav>
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/chat">Chat</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/chat" element={<ProtectedChatRoom />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;
