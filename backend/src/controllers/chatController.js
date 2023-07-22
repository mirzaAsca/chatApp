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
    const messageId = await Message.incr('message:id');
    const timestamp = Date.now();
    await Message.hset(`message:${messageId}`, 'sender', username, 'text', text, 'timestamp', timestamp);
    await Message.lpush(`room:${roomId}:messages`, messageId);

    const message = { id: messageId, sender: username, text, timestamp };
    req.io.to(roomId).emit('receiveMessage', message);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'An error occurred while sending the message', details: error.message });  // Add more detailed error message
  }
};


exports.getMessages = async (req, res, next) => {
  console.log('getMessages controller called');

  const roomId = req.params.roomId;
  const { username } = req.user;

  console.log('roomId:', roomId);
  console.log('username:', username);

  const members = await Room.client.smembers(`room:${roomId}:members`);

  console.log('members:', members);

  if (!members.includes(username)) {
    return res.status(403).json({ error: 'You are not a member of this room' });
  }

  try {
    const messageIds = await Message.lrange(`room:${roomId}:messages`, 0, -1);
    console.log('messageIds:', messageIds);
    const messages = [];
    for (let messageId of messageIds) {
      const message = await Message.hgetall(`message:${messageId}`);
      message.id = messageId; // Add this line
      messages.push(message);
    }
    console.log('messages:', messages);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'An error occurred while getting the messages', details: error.message });
  }
};
