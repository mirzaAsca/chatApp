const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message:
    "Too many messages created from this IP, please try again after an hour",
});

router.post("/send", authenticate, apiLimiter, chatController.sendMessage);
router.post("/sendDirect", authenticate, apiLimiter, chatController.sendDirectMessage); // New route for direct messages
router.get("/messages/:roomId", authenticate, chatController.getMessages);
router.get("/privateMessages/:chatId", authenticate, chatController.getPrivateMessages); // Modified route
router.get('/conversation/:receiverId', authenticate, chatController.getConversation);
router.get('/lastReadMessage/:userId/:chatId', async (req, res, next) => {
  const { userId, chatId } = req.params;
  const readMessagesKey = `readMessages:${userId}:${chatId}`;
  const lastReadMessageId = await client.get(readMessagesKey);
  res.json(lastReadMessageId || null);
});


module.exports = router;
