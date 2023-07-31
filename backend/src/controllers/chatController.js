// Importing required models
const Message = require("../models/Message");
const Room = require("../models/Room");

// Controller to handle sending a message in a room
exports.sendMessage = async (req) => {
  const { text, roomId } = req.body;
  const { username } = req.user;

  // Check if the user is a member of the room
  const members = await Room.client.smembers(`room:${roomId}:members`);
  if (!members.includes(username)) {
    throw new Error("You are not a member of this room");
  }

  try {
    // Create a new message and save it in Redis
    const messageId = await Message.incr("message:id");
    const timestamp = Date.now();
    await Message.hset(
      `message:${messageId}`,
      "sender",
      username,
      "text",
      text,
      "timestamp",
      timestamp
    );
    await Message.lpush(`room:${roomId}:messages`, messageId);

    // Emit the 'receiveMessage' event to all clients
    const message = { id: messageId, sender: username, roomId, text, timestamp };
    req.io.emit("receiveMessage", message);

    return { status: 200, message: "Message sent successfully" };
  } catch (error) {
    console.error("Send message error:", error);
    throw new Error("An error occurred while sending the message");
  }
};

// Controller to get all messages from a room
exports.getMessages = async (req, res, next) => {
  const roomId = req.params.roomId;
  const { username } = req.user;

  // Check if the user is a member of the room
  const members = await Room.client.smembers(`room:${roomId}:members`);
  if (!members.includes(username)) {
    return res.status(403).json({ error: "You are not a member of this room" });
  }

  try {
    // Fetch all messages from the room and return
    const messageIds = await Message.lrange(`room:${roomId}:messages`, 0, -1);
    const messages = await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await Message.hgetall(`message:${messageId}`);
        message.id = messageId;
        return message;
      })
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "An error occurred while getting the messages", details: error.message });
  }
};

// Controller to handle sending a direct message
exports.sendDirectMessage = async (req) => {
  const { text, sender, receiver } = req.body;

  // Compute the chatId
  const chatId = [sender, receiver].sort().join('-');

  try {
    // Create a new direct message and save it in Redis
    const messageId = await Message.incr("directMessage:id");
    const timestamp = Date.now();
    await Message.hset(
      `directMessage:${messageId}`,
      "sender",
      sender,
      "chatId",
      chatId,
      "text",
      text,
      "timestamp",
      timestamp,
      "status",
      "delivered"
    );
    await Message.lpush(`direct:${chatId}:messages`, messageId);

    // Emit the 'privateMessage' event to all clients
    const message = { id: messageId, sender, chatId, text, timestamp, status: "delivered" };
    req.io.emit("privateMessage", message);

    return { status: 200, message: "Message sent successfully" };
  } catch (error) {
    console.error("Send direct message error:", error);
    throw new Error("An error occurred while sending the message");
  }
};

// Controller to get all direct messages between two users
exports.getPrivateMessages = async (req, res, next) => {
  const chatId = req.params.chatId;

  try {
    // Fetch all direct messages between the two users and return
    const messageIds = await Message.lrange(`direct:${chatId}:messages`, 0, -1);
    const messages = await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await Message.hgetall(`directMessage:${messageId}`);
        message.id = messageId;
        return message;
      })
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get private messages error:", error);
    res.status(500).json({ error: "An error occurred while getting the messages", details: error.message });
  }
};

// Controller to get all direct messages in a conversation
exports.getConversation = async (req, res, next) => {
  const { id: senderId } = req.user;
  const { receiverId } = req.params;

  // Ensure the chatId is always the same regardless of who is the sender and receiver
  const [user1, user2] = [senderId, receiverId].sort();

  try {
    // Fetch all messages in the conversation and return
    const messageIds = await Message.lrange(`direct:${user1}:${user2}:messages`, 0, -1);
    const messages = await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await Message.hgetall(`directMessage:${messageId}`);
        message.id = messageId;
        return message;
      })
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "An error occurred while getting the conversation", details: error.message });
  }
};

// Controller to update the status of a message
exports.updateMessageStatus = async (req, res, next) => {
  const { messageId, status } = req.body;

  try {
    // Update the status of the message in Redis
    await Message.hset(`directMessage:${messageId}`, "status", status);

    // Emit the 'updateMessageStatus' event to all clients
    const message = await Message.hgetall(`directMessage:${messageId}`);
    const updatedMessage = { id: messageId, sender: message.sender, chatId: message.chatId, text: message.text, timestamp: message.timestamp, status };
    req.io.emit("updateMessageStatus", updatedMessage);

    res.status(200).json({ message: "Message status updated successfully" });
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(500).json({ error: "An error occurred while updating the message status", details: error.message });
  }
};
