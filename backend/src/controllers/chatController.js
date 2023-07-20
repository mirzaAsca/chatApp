const Message = require('../models/Message');

exports.sendMessage = async (req, res, next) => {
  const { sender, text } = req.body;

  try {
    const messageKey = `message:${sender}:${Date.now()}`;
    await Message.set(messageKey, JSON.stringify({ text, timestamp: Date.now() }));

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};

// chatController.js
exports.getMessages = async (req, res, next) => {
  try {
    let cursor = 0;
    let messages = [];

    do {
      const result = await Message.scan(cursor, 'MATCH', 'message:*');
      cursor = result[0];
      const keys = result[1];

      for (const key of keys) {
        const message = await Message.get(key);
        messages.push(JSON.parse(message));
      }
    } while (cursor !== '0');

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

