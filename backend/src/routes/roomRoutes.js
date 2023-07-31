// Import necessary modules
const express = require('express');
const roomController = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');

// Initialize Express router
const router = express.Router();

// Define endpoint for creating a new room
// This route requires authentication
router.post('/create', authenticate, roomController.createRoom);

// Define endpoint for joining a room by ID
// This route requires authentication
router.post('/join/:roomId', authenticate, roomController.joinRoom);

// Define endpoint for leaving a room by ID
// This route requires authentication
router.post('/leave/:roomId', authenticate, roomController.leaveRoom);

// Define endpoint for getting all rooms
// This route requires authentication
router.get('/', authenticate, roomController.getRooms);

// Define endpoint for deleting a room by ID
// This route requires authentication
router.delete('/:roomId', authenticate, roomController.deleteRoom);

// Define endpoint for editing a room by ID
// This route requires authentication
router.put('/:roomId', authenticate, roomController.editRoom);

// Define endpoint for getting all members of a room by ID
// This route requires authentication
router.get('/:roomId/members', authenticate, roomController.getRoomMembers);

// Export the router to be used in other parts of the application
module.exports = router;
