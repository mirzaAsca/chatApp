// Import the IORedis library
const IORedis = require('ioredis');

// Initialize a new Redis client
// The 'retryStrategy' option is a function that's called when the client loses the connection to the Redis server
// It returns the delay amount in milliseconds to use before reconnecting. If no value is returned, the client will stop trying to reconnect
const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: times => Math.min(times * 50, 2000),
});

// Event listener for successful connection to the Redis server
client.on('connect', () => {
  console.log('Redis client connected');
});

// Event listener for connection errors with the Redis server
client.on('error', err => {
  console.log('Error', err);
});

// Functions that manipulate the 'Room' data in Redis
// Create a new room with a specified name
async function createRoom(name) {
  const roomId = await client.incr('room:id');
  await client.hset(`room:${roomId}`, 'name', name);
  await client.sadd('rooms', roomId);
  return roomId;
}

// Add a user to a specified room
async function joinRoom(roomId, username) {
  await client.sadd(`room:${roomId}:members`, username);
}

// Remove a user from a specified room
async function leaveRoom(roomId, username) {
  await client.srem(`room:${roomId}:members`, username);
}

// Retrieve all rooms
async function getRooms() {
  const roomIds = await client.smembers('rooms');
  const rooms = [];

  // Iterate over each room and fetch the room details and its members
  for (let roomId of roomIds) {
    const room = await client.hgetall(`room:${roomId}`);
    room.members = await client.smembers(`room:${roomId}:members`);
    room.id = roomId;
    rooms.push(room);
  }
  return rooms;
}

// Delete a specified room
async function deleteRoom(roomId) {
  await client.del(`room:${roomId}`);
  await client.srem('rooms', roomId);
}

// Rename a specified room
async function editRoom(roomId, newName) {
  await client.hset(`room:${roomId}`, 'name', newName);
}

// Export the functions for use in other files
module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRooms,
  deleteRoom,
  editRoom,
  client,
};
