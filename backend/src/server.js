// Import necessary dependencies
require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');

// Import routes
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const roomRoutes = require("./routes/roomRoutes");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");

// Process-level error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.log('Caught exception:', err, 'Exception origin:', origin);
});

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

// Create Express app
const app = express();

// Middleware for logging incoming requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

// Create server with Socket.IO and CORS configuration
const server = http.createServer(app);
const io = require("./config/socket")(server, corsOptions);

// Express middleware configuration
app.use(cors(corsOptions));  // Enable CORS with the given options
app.use(express.json());  // Enable JSON request body parsing
app.use(cookieParser());  // Enable cookie parsing

// Middleware to attach Socket.IO instance to the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routing
app.use("/api/users", userRoutes);  // User-related routes
app.use("/api/chat", chatRoutes);  // Chat-related routes
app.use("/api/rooms", roomRoutes);  // Room-related routes

// Error handling middleware
app.use(errorHandler);

// Start the server
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
