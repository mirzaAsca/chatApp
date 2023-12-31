if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: "./.env.production" });
} else {
  require("dotenv").config({ path: "./.env.development" });
}

const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const roomRoutes = require("./routes/roomRoutes");
const { errorHandler } = require("./middleware/errorHandler");
//const rateLimiter = require("./middleware/rateLimit");
const User = require("./models/User");

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err, origin) => {
  console.log("Caught exception:", err, "Exception origin:", origin);
});

// Check the NODE_ENV variable. If it's 'production', set the origin to the production URL.
// Otherwise, use the development URL (localhost)
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL
      : "http://localhost:3000",
  credentials: true,
};

// Create Express app
const app = express();

// Add logging middleware
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

// Add Socket.IO instance to the request object
const server = http.createServer(app);
const io = require("./config/socket")(server, corsOptions);

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

//app.use('/api/chat/messages', rateLimiter)

// Add Socket.IO instance to the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);

// Error handling middleware
app.use(errorHandler);

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

// io.js
const socketIo = require("socket.io");

module.exports = function (server, corsOptions) {
  const io = socketIo(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("sendMessage", (message) => {
      io.to(message.roomId).emit("receiveMessage", message);
    });

    socket.on("updateMessageStatus", async ({ messageId, status }) => {
      console.log(
        `Received updateMessageStatus event from client with message ID: ${messageId} and status: ${status}`
      );

      try {
        // Update the message status in the database
        await Message.hset(`directMessage:${messageId}`, "status", status);
        console.log(`Updated status of message ${messageId} to ${status}`);

        // Emit an updateMessageStatus event back to the clients with the updated message status
        io.emit("updateMessageStatus", { messageId, status });
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};
module.exports = io;
