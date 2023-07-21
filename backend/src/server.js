require("dotenv").config();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.log('Caught exception:', err, 'Exception origin:', origin);
});

const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser'); // Add this line
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const roomRoutes = require("./routes/roomRoutes"); // Add this line
const { errorHandler } = require("./middleware/errorHandler");
const User = require("./models/User");
const corsOptions = {
  origin: 'http://localhost:3000', // replace with the origin of your front-end app
  credentials: true,
};

// Create Express app
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Add this line

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes); // Add this line

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Connect socket.io with the server
const io = require("./config/socket")(server);

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

// Export the server and io for other modules to use
module.exports = { server, io, client: User.client };
