// Import necessary dependencies
const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
}

// Import the IORedis module.
const IORedis = require("ioredis");

console.log("Redis URL:", process.env.REDIS_URL);

// Initialize a new IORedis client with the Redis URL from environment variables.
const client = new IORedis(process.env.REDIS_URL);

// Event listener for successful connection to Redis.
// Logs a success message to the console when the client successfully connects to the Redis server.
client.on("connect", () => {
  console.log("Connected to Redis...");
});

// Event listener for connection errors.
// Logs an error message to the console if an error occurs while trying to connect to the Redis server.
client.on("error", (err) => {
  console.log("Redis error: ", err);
});

// Export the client object for use in other parts of the application.
module.exports = client;
