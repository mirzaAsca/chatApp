// chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/send', authenticate, chatController.sendMessage);
router.get('/messages/:roomId', authenticate, chatController.getMessages);

module.exports = router;
