const socketIo = require("socket.io");
const chatController = require("../controllers/chatController");
const Redis = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10, // 10 requests
  duration: 60, // per 60 seconds by IP
});

const onlineUsers = {}; // added this line to keep track of online users

module.exports = (server, corsOptions) => {
  const io = socketIo(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinRoom", (roomId, username) => {
      // added username parameter
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      onlineUsers[socket.id] = username; // keep track of the connected user
      io.emit("userOnline", username); // emit userOnline event
    });

    socket.on("sendMessage", async (message) => {
      console.log("Received sendMessage event with message", message);

      socket.on("logout", (username) => {
        // Find the socket ID of the user who logged out
        const socketId = Object.keys(onlineUsers).find(
          (id) => onlineUsers[id] === username
        );
        if (socketId) {
          delete onlineUsers[socketId];
          io.emit("userOffline", username);
        }
      });

      rateLimiter
        .consume(socket.id) // use socket.id as unique user identifier
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
          console.log(
            `Rate limit exceeded for ${socket.id}. Remaining points: ${rejRes.remainingPoints}`
          );
          // Handle rate limit exceed. You might want to send a message to the user, close the connection, etc.
        });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      let username = onlineUsers[socket.id]; // get the username of the disconnected user
      delete onlineUsers[socket.id]; // remove the disconnected user from onlineUsers
      io.emit("userOffline", username); // emit userOffline event
    });
  });

  return io;
};
