const socketIo = require('socket.io');

module.exports = (server, corsOptions) => {
  const io = require('socket.io')(server, {
    cors: corsOptions
  });

  const chatController = require('../controllers/chatController');

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('sendMessage', async (message) => {
      console.log('Received sendMessage event with message', message);
      const req = { body: message, user: { username: message.sender }, io: io };
      await chatController.sendMessage(req);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

