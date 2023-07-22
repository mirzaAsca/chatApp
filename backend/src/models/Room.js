// Room.js
const IORedis = require('ioredis');
const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: function(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', (err) => {
  console.log('Error', err);
});

// Room data structure
// id (IORedis will generate this id)
// name
// members

async function createRoom(name) {
  const roomId = await client.incr('room:id');
  await client.hset(`room:${roomId}`, 'name', name);
  await client.sadd('rooms', roomId);
  return roomId;
}

async function joinRoom(roomId, username) {
  await client.sadd(`room:${roomId}:members`, username);
}

async function leaveRoom(roomId, username) {
  await client.srem(`room:${roomId}:members`, username);
}

async function getRooms() {
  const roomIds = await client.smembers('rooms');
  const rooms = [];
  for (let roomId of roomIds) {
    const room = await client.hgetall(`room:${roomId}`);
    room.members = await client.smembers(`room:${roomId}:members`);
    room.id = roomId; // Add this line
    rooms.push(room);
  }
  return rooms;
}

async function deleteRoom(roomId) {
  await client.del(`room:${roomId}`);
  await client.srem('rooms', roomId);
}

async function editRoom(roomId, newName) {
  await client.hset(`room:${roomId}`, 'name', newName);
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRooms,
  deleteRoom,
  editRoom,
  client,
};