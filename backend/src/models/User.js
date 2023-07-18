console.log("REDIS_HOST:", process.env.REDIS_HOST);
console.log("REDIS_PORT:", process.env.REDIS_PORT);
console.log("REDIS_PASSWORD:", process.env.REDIS_PASSWORD);

const IORedis = require("ioredis");
const bcrypt = require("bcrypt");

console.log("About to create Redis client");

// Create Redis client
const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: function(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

console.log("Redis client created");

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

console.log("Successfully connected to Redis");

// Redis functions
async function addUser(username, password) {
  const hashedPassword = await hashPassword(password);
  await client.hset(username, "password", hashedPassword);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function verifyUser(username, password) {
  const hashedPassword = await client.hget(username, "password");
  return bcrypt.compare(password, hashedPassword);
}

module.exports = {
  addUser,
  verifyUser,
  client,
};
