// Importing required modules
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

// Setting up rate limiting to prevent abuse. Each IP is limited to 3 requests every 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, 
  message: "Too many messages created from this IP, please try again after an hour",
});

// Route for sending a message in a chat room. Authentication and rate limiting middleware are applied
router.post("/send", authenticate, apiLimiter, chatController.sendMessage);

// Route for sending a direct message. Authentication and rate limiting middleware are applied
router.post("/sendDirect", authenticate, apiLimiter, chatController.sendDirectMessage);

// Route for fetching messages from a room. Authentication middleware is applied
router.get("/messages/:roomId", authenticate, chatController.getMessages);

// Route for fetching private messages from a chat. Authentication middleware is applied
router.get("/privateMessages/:chatId", authenticate, chatController.getPrivateMessages);

// Route for fetching a conversation with a specific receiver. Authentication middleware is applied
router.get('/conversation/:receiverId', authenticate, chatController.getConversation);

// Route for fetching the last read message in a chat. The route is asynchronous as it involves fetching data from Redis
router.get('/lastReadMessage/:userId/:chatId', async (req, res, next) => {
  const { userId, chatId } = req.params;
  const readMessagesKey = `readMessages:${userId}:${chatId}`;
  const lastReadMessageId = await client.get(readMessagesKey);
  res.json(lastReadMessageId || null);
});

// Exporting the router to be used in other modules
module.exports = router;
