import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

// Import socket handlers
import setupSocketHandlers from './sockets/index.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Setup socket event handlers
setupSocketHandlers(io);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    server.listen(env.PORT, () => {
      console.log(`\n✓ Server running on port ${env.PORT}`);
      console.log(`✓ Environment: ${env.NODE_ENV}`);
      console.log(`✓ MongoDB: ${env.MONGO_URI}`);
      console.log(`✓ CORS Origin: ${env.CORS_ORIGIN}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { server, io };
