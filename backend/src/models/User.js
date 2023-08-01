// Required packages
const IORedis = require("ioredis");
const bcryptjs = require("bcryptjs");

// Create a Redis client
// The `retryStrategy` function is used to control how often and when to retry connecting.
// The delay between retries is calculated as a minimum of the retry attempt times 50 and 2000 milliseconds.
const redisClient = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: function (times) {
    return Math.min(times * 50, 2000);
  },
});

// Event listeners for the Redis client.
// On 'connect', the client will log a success message.
redisClient.on("connect", () => {
  console.log("Successfully connected to Redis");
});

// On 'error', the client will log the error.
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// A helper function to hash a password using bcryptjs.
async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

// A function to add a new user to the Redis store.
// The user's password is hashed before being stored.
async function addUser(username, password) {
  const hashedPassword = await hashPassword(password);
  await redisClient.hset(`user:${username}`, "password", hashedPassword);
}

// A function to verify if a user exists in the Redis store.
// It checks if the 'password' field of the user exists.
async function verifyUser(username) {
  const password = await redisClient.hget(`user:${username}`, 'password');
  return password !== null;
}

// A function to retrieve a user's data from the Redis store.
async function getUser(username) {
  return await redisClient.hgetall(`user:${username}`);
}

// Expose the Redis client and helper functions as a module.
module.exports = {
  addUser,
  verifyUser,
  getUser,
  client: redisClient,
};
