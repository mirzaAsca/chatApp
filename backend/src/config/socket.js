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

// Maintain a mapping of user IDs to their socket IDs
const userSocketIds = {};

module.exports = (server, corsOptions) => {
  const io = socketIo(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("login", (userId) => {
      console.log(`User logged in with ID: ${userId}, Socket ID: ${socket.id}`);
      userSocketIds[userId] = socket.id;
      socket.join(userId);
    });

    socket.on("logout", (userId) => {
      console.log(`User logged out with ID: ${userId}`);
      delete userSocketIds[userId];
      socket.leave(userId);
    });

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
          console.log(
            `Rate limit exceeded for ${socket.id}. Remaining points: ${rejRes.remainingPoints}`
          );
        });
    });

    socket.on("sendPrivateMessage", async (message) => {
      console.log("Received sendPrivateMessage event with message", message);

      rateLimiter
        .consume(socket.id)
        .then(async () => {
          const req = {
            body: message,
            user: { id: message.senderId },
            io: io,
            userSocketIds: userSocketIds, // Add this line
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
          console.log(
            `Rate limit exceeded for ${socket.id}. Remaining points: ${rejRes.remainingPoints}`
          );
        });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
