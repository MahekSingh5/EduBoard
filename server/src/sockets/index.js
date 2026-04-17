import setupWhiteboardSocket from './whiteboard.socket.js';
import setupChatSocket from './chat.socket.js';
import setupRoomSocket from './room.socket.js';
import setupQuizSocket from './quiz.socket.js';
import setupReactionSocket from './reaction.socket.js';
import setupWebRTCSocket from './webrtc.socket.js';
import setupAudioSocket from './audio.socket.js';
import setupVideoSocket from './video.socket.js';

const setupSocketHandlers = (io) => {
  // Middleware to verify token on socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Token verification would go here
      socket.userId = socket.handshake.auth.userId;
      socket.username = socket.handshake.auth.username;
      socket.role = socket.handshake.auth.role;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Setup audio and video socket handlers (global, not per-socket)
  setupAudioSocket(io);
  setupVideoSocket(io);

  // Connection event
  io.on('connection', (socket) => {
    console.log(`✓ User connected: ${socket.username} (${socket.id})`);
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Setup all socket event handlers
    setupRoomSocket(socket, io);
    setupChatSocket(socket, io);
    setupWhiteboardSocket(socket, io);
    setupQuizSocket(socket, io);
    setupReactionSocket(socket, io);
    setupWebRTCSocket(socket, io);

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`✗ User disconnected: ${socket.username} (${socket.id})`);

      io.emit('user-left', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date(),
      });
    });

    // Error event
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.username}:`, error);
    });
  });

  return io;
};

export default setupSocketHandlers;
