const Message = require('../models/Message');

exports.sendMessage = async (req, res, next) => {
  const { sender, text } = req.body;

  try {
    // Store the message in the database
    const message = await Message.set(`message:${sender}`, JSON.stringify({ text, timestamp: Date.now() }));

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    // Retrieve the most recent messages from the database
    const messages = await Message.get('message:*');

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};
