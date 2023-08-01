// Require the dotenv module to load environment variables from a .env file into process.env
require("dotenv").config();

// Import the ioredis module for Redis connection
const Redis = require("ioredis");

// Initialize the Redis client with configuration from environment variables
const redis = new Redis({
  host: process.env.REDIS_HOST,  // The host of the Redis server
  port: process.env.REDIS_PORT,  // The port of the Redis server
  password: process.env.REDIS_PASSWORD,  // The password for the Redis server, if any
});

// Set up an event listener for successful Redis connection
redis.on("connect", () => {
  console.log("Redis client connected");
});

// Set up an event listener for Redis connection error
redis.on("error", (err) => {
  console.error("Redis error:", err);
});

// Keep the script running until manually stopped
// This is done by setting an interval that does nothing but keeps the event loop busy
setInterval(() => {}, 1000);
