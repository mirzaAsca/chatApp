// Import necessary modules
const path = require('path');
const dotenv = require('dotenv');
const socketIo = require("socket.io");
const chatController = require("../controllers/chatController");
const Redis = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
}

// Initialize Redis client with environment variables
const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Initialize RateLimiter to control the request rate
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10, // 10 requests
  duration: 60, // per 60 seconds by IP
});

// Maintain a mapping of user IDs to their socket IDs
const userSocketIds = {};

// Socket configuration
module.exports = (server, corsOptions) => {
  const io = socketIo(server, {
    cors: corsOptions,
  });

  // Handle new connections
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user login
    socket.on('login', (userId) => {
      console.log(`User logged in with ID: ${userId}, Socket ID: ${socket.id}`);
      userSocketIds[userId] = socket.id;
      socket.join(userId);
      socket.broadcast.emit('userOnline', userId); // Announce the user's online status
    });

    // Handle user logout
    socket.on('userLogout', (username) => {
      console.log(`User logged out with username: ${username}`);
      socket.broadcast.emit('userOffline', username); // Announce the user's offline status
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find the user that got disconnected
      const disconnectedUser = Object.keys(userSocketIds).find(key => userSocketIds[key] === socket.id);
  
      // If a user was found, remove them from the mapping and announce their offline status
      if (disconnectedUser) {
        delete userSocketIds[disconnectedUser];
        socket.broadcast.emit('userOffline', disconnectedUser);
      }
    });

    // Handle message sending
    socket.on("sendMessage", async (message) => {
      console.log("Received sendMessage event with message", message);
      rateLimiter
        .consume(socket.id)
        .then(async () => {
          const req = {
            body: message,
            user: { username: message.sender },
            io: io,
          };
          try {
            const result = await chatController.sendMessage(req);
            console.log(result);
          } catch (error) {
            console.error(error.message);
          }
        })
        .catch((rejRes) => {
          console.log(`Rate limit exceeded for ${socket.id}. Remaining points: ${rejRes.remainingPoints}`);
        });
    });

    // Handle private message sending
    socket.on("sendPrivateMessage", async (message) => {
      console.log("Received sendPrivateMessage event with message", message);
      rateLimiter
        .consume(socket.id)
        .then(async () => {
          const req = {
            body: message,
            user: { id: message.senderId },
            io: io,
            userSocketIds: userSocketIds,
          };
          try {
            const result = await chatController.sendDirectMessage(req);
            console.log(result);

            // Emit the message to the receiver's room
            io.to(userSocketIds[message.receiverId]).emit(
              "privateMessage",
              result
            );
          } catch (error) {
            console.error(error.message);
          }
        })
        .catch((rejRes) => {
          console.log(`Rate limit exceeded for ${socket.id}. Remaining points: ${rejRes.remainingPoints}`);
        });
    });
  });

  return io;
};
