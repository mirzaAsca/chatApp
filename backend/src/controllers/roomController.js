// roomController.js
const Room = require('../models/Room');

exports.createRoom = async (req, res, next) => {
  const { name } = req.body;

  try {
    const roomId = await Room.createRoom(name);
    res.status(201).json({ message: 'Room created successfully', roomId });
  } catch (error) {
    console.error('Create room error:', error);
    next(error);
  }
};

exports.joinRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const { username } = req.user;

  try {
    await Room.joinRoom(roomId, username);
    res.status(200).json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Join room error:', error);
    next(error);
  }
};

exports.leaveRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const { username } = req.user;

  try {
    await Room.leaveRoom(roomId, username);
    res.status(200).json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    next(error);
  }
};

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.getRooms();
    res.status(200).json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    await Room.deleteRoom(roomId);
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    next(error);
  }
};

exports.editRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const { newName } = req.body;

  try {
    await Room.editRoom(roomId, newName);
    res.status(200).json({ message: 'Room edited successfully' });
  } catch (error) {
    console.error('Edit room error:', error);
    next(error);
  }
};