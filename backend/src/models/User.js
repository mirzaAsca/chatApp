console.log("REDIS_HOST:", process.env.REDIS_HOST);
console.log("REDIS_PORT:", process.env.REDIS_PORT);
console.log("REDIS_PASSWORD:", process.env.REDIS_PASSWORD);

const IORedis = require("ioredis");
const bcrypt = require("bcrypt");

console.log("About to create Redis client");

// Create Redis client
const redisClient = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: function (times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

console.log("Redis client created");

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

console.log("Successfully connected to Redis");

// Redis functions
async function addUser(username, password) {
  const hashedPassword = await hashPassword(password);
  await redisClient.hset(`user:${username}`, "password", hashedPassword);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function verifyUser(username) {
  const password = await redisClient.hget(`user:${username}`, 'password');
  return password !== null;
}

async function getUser(username) {
  return await redisClient.hgetall(`user:${username}`);
}

module.exports = {
  addUser,
  verifyUser,
  getUser,
  client: redisClient,
};
