const socketio = require('socket.io');
const Redis = require('ioredis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 3, // 10 requests
  duration: 60, // per 60 seconds by IP
});

const io = socketio(server, corsOptions);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('chat message', (msg) => {
    rateLimiter.consume(socket.id) // use socket.id as unique user identifier
      .then(() => {
        io.emit('chat message', msg);
      })
      .catch((rejRes) => {
        console.log(`Rate limit exceeded for ${socket.id}. Remaining points: ${rejRes.remainingPoints}`);
        // Handle rate limit exceed. You might want to send a message to the user, close the connection, etc.
      });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
