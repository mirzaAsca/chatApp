// Import the IORedis module.
const IORedis = require('ioredis');

// Initialize a new IORedis client with a configuration object.
// The configuration options (host, port, password) are fetched from environment variables.
const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Event listener for successful connection to Redis.
// Logs a success message to the console when the client successfully connects to the Redis server.
client.on('connect', () => {
  console.log('Connected to Redis...');
});

// Event listener for connection errors.
// Logs an error message to the console if an error occurs while trying to connect to the Redis server.
client.on('error', (err) => {
  console.log('Redis error: ', err);
});

// Export the client object for use in other parts of the application.
module.exports = client;
