const Message = require("../models/Message");
const Room = require("../models/Room");

exports.sendMessage = async (req) => {
  const { text, roomId } = req.body;
  const { username } = req.user;

  const members = await Room.client.smembers(`room:${roomId}:members`);

  if (!members.includes(username)) {
    throw new Error("You are not a member of this room");
  }

  try {
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

    const message = {
      id: messageId, 
      sender: username, 
      roomId, 
      text, 
      timestamp
    };

    console.log(`Emitting 'receiveMessage' event with message: ${JSON.stringify(message)}`);
    req.io.emit("receiveMessage", message); // Replace io.to(chatId).emit with io.emit

    return { status: 200, message: "Message sent successfully" };
  } catch (error) {
    console.error("Send message error:", error);
    throw new Error("An error occurred while sending the message");
  }
};



exports.getMessages = async (req, res, next) => {
  console.log("getMessages controller called");

  const roomId = req.params.roomId;
  const { username } = req.user;

  console.log("roomId:", roomId);
  console.log("username:", username);

  const members = await Room.client.smembers(`room:${roomId}:members`);

  console.log("members:", members);

  if (!members.includes(username)) {
    return res.status(403).json({ error: "You are not a member of this room" });
  }

  try {
    const messageIds = await Message.lrange(`room:${roomId}:messages`, 0, -1);
    const messages = [];
    for (let messageId of messageIds) {
      const message = await Message.hgetall(`message:${messageId}`);
      message.id = messageId;
      messages.push(message);
    }

    console.log("messages:", messages);
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      error: "An error occurred while getting the messages",
      details: error.message,
    });
  }
};

exports.sendDirectMessage = async (req) => {
  console.log(`req.user: ${JSON.stringify(req.user)}`);

  const { text, sender, receiver } = req.body;

  console.log(`sender: ${sender}`);
  console.log(`receiver: ${receiver}`);

  // Compute the chatId
  const chatId = [sender, receiver].sort().join('-');
  
  console.log(`chatId: ${chatId}`);

  try {
    const messageId = await Message.incr("directMessage:id");
    const timestamp = Date.now();

    await Message.hset(
      `directMessage:${messageId}`,
      "sender",
      sender,  // Change senderUsername to sender
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

    const message = {
      id: messageId,
      sender: sender,
      chatId,
      text,
      timestamp,
      status: "delivered"
    };
    console.log(`Emitting 'privateMessage' event with message: ${JSON.stringify(message)}`);
    req.io.emit("privateMessage", message); // Replace io.to(chatId).emit with io.emit

    return { status: 200, message: "Message sent successfully" };
  } catch (error) {
    console.error("Send direct message error:", error);
    throw new Error("An error occurred while sending the message");
  }
};




exports.getPrivateMessages = async (req, res, next) => {
  const chatId = req.params.chatId;
  const { username: senderUsername } = req.user;
  console.log('Received chatId:', chatId); // Add this line


  try {
    const messageIds = await Message.lrange(`direct:${chatId}:messages`, 0, -1);

    const messages = [];
    for (let messageId of messageIds) {
      const message = await Message.hgetall(`directMessage:${messageId}`);
      message.id = messageId;
      messages.push(message);
    }

    console.log(`Fetched private messages: ${JSON.stringify(messages)}`);

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get private messages error:", error);
    res.status(500).json({
      error: "An error occurred while getting the messages",
      details: error.message,
    });
  }
};


exports.getConversation = async (req, res, next) => {
  const { id: senderId } = req.user;
  const { receiverId } = req.params;

  const [user1, user2] = [senderId, receiverId].sort();

  try {
    const messageIds = await Message.lrange(
      `direct:${user1}:${user2}:messages`,
      0,
      -1
    );

    const messages = [];
    for (let messageId of messageIds) {
      const message = await Message.hgetall(`directMessage:${messageId}`);
      message.id = messageId;
      messages.push(message);
    }

    console.log(`Fetched conversation: ${JSON.stringify(messages)}`);
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      error: "An error occurred while getting the conversation",
      details: error.message,
    });
  }
};

exports.updateMessageStatus = async (req, res, next) => {
  const { messageId, status } = req.body;
  const { username: senderUsername } = req.user;

  try {
    const message = await Message.hgetall(`directMessage:${messageId}`);
    if (message.sender === senderUsername) {
      throw new Error("You cannot update the status of a message you sent");
    }

    await Message.hset(`directMessage:${messageId}`, "status", status);
    console.log(`Updated status of message ${messageId} to ${status}`);

    const updatedMessage = {
      id: messageId,
      sender: message.sender,
      chatId: message.chatId,
      text: message.text,
      timestamp: message.timestamp,
      status
    };
    req.io.emit("updateMessageStatus", updatedMessage);
    res.status(200).json({ message: "Message status updated successfully" });
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(500).json({
      error: "An error occurred while updating the message status",
      details: error.message,
    });
  }
};
