// Import the Room model
const Room = require('../models/Room');

// Function to handle GET request for room members
exports.getRoomMembers = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    // Fetch members from Redis store
    const members = await Room.client.smembers(`room:${roomId}:members`);
    // Return members list in response
    res.status(200).json({ members });
  } catch (error) {
    console.error('Error in fetching room members:', error);
    next(error);
  }
};

// Function to handle POST request for room creation
exports.createRoom = async (req, res, next) => {
  const { name } = req.body;

  try {
    // Call the createRoom method of the Room model
    const roomId = await Room.createRoom(name);
    // Return a success message and room details in response
    res.status(201).json({
      message: 'Room created successfully',
      room: { id: roomId, name: name }
    });
  } catch (error) {
    console.error('Error in creating room:', error);
    next(error);
  }
};

// Function to handle PUT request for joining a room
exports.joinRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const { username } = req.user;

  try {
    // Call the joinRoom method of the Room model
    await Room.joinRoom(roomId, username);
    // Return a success message in response
    res.status(200).json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Error in joining room:', error);
    next(error);
  }
};

// Function to handle PUT request for leaving a room
exports.leaveRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const { username } = req.user;

  try {
    // Call the leaveRoom method of the Room model
    await Room.leaveRoom(roomId, username);
    // Return a success message in response
    res.status(200).json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Error in leaving room:', error);
    next(error);
  }
};

// Function to handle GET request for list of rooms
exports.getRooms = async (req, res, next) => {
  try {
    // Call the getRooms method of the Room model
    const rooms = await Room.getRooms();
    // Return list of rooms in response
    res.status(200).json({ rooms });
  } catch (error) {
    console.error('Error in fetching rooms:', error);
    next(error);
  }
};

// Function to handle DELETE request for a room
exports.deleteRoom = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    // Call the deleteRoom method of the Room model
    await Room.deleteRoom(roomId);
    // Return a success message in response
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error in deleting room:', error);
    next(error);
  }
};

// Function to handle PUT request for editing a room
exports.editRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const { newName } = req.body;

  try {
    // Call the editRoom method of the Room model
    await Room.editRoom(roomId, newName);
    // Return a success message in response
    res.status(200).json({ message: 'Room edited successfully' });
  } catch (error) {
    console.error('Error in editing room:', error);
    next(error);
  }
};
