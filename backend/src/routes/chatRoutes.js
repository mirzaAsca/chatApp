const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 100 requests per windowMs
  message:
    "Too many messages created from this IP, please try again after an hour",
});

router.post("/send", authenticate, apiLimiter, chatController.sendMessage);
router.get("/messages/:roomId", authenticate, chatController.getMessages);

module.exports = router;
