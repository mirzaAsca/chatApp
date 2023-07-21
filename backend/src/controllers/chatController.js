// chatController.js
const Message = require('../models/Message');
const Room = require('../models/Room');

exports.sendMessage = async (req, res, next) => {
  const { text, roomId } = req.body;
  const { username } = req.user;

  const members = await Room.client.smembers(`room:${roomId}:members`);

  if (!members.includes(username)) {
    return res.status(403).json({ error: 'You are not a member of this room' });
  }

  try {
    const messageId = await Message.client.incr('message:id');
    const timestamp = Date.now();
    await Message.client.hset(`message:${messageId}`, 'sender', username, 'text', text, 'timestamp', timestamp);
    await Message.client.lpush(`room:${roomId}:messages`, messageId);

    const message = { id: messageId, sender: username, text, timestamp };
    req.io.to(roomId).emit('receiveMessage', message);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  const { roomId } = req.query;
  const { username } = req.user;

  const members = await Room.client.smembers(`room:${roomId}:members`);

  if (!members.includes(username)) {
    return res.status(403).json({ error: 'You are not a member of this room' });
  }

  try {
    const messageIds = await Message.client.lrange(`room:${roomId}:messages`, 0, -1);
    const messages = [];
    for (let messageId of messageIds) {
      const message = await Message.client.hgetall(`message:${messageId}`);
      messages.push(message);
    }
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    next(error);
  }
};
