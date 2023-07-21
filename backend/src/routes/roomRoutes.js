// roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');

router.post('/create', authenticate, roomController.createRoom);
router.post('/join/:roomId', authenticate, roomController.joinRoom);
router.post('/leave/:roomId', authenticate, roomController.leaveRoom);
router.get('/', authenticate, roomController.getRooms);
router.delete('/:roomId', authenticate, roomController.deleteRoom);
router.put('/:roomId', authenticate, roomController.editRoom);


module.exports = router;
