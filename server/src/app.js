import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import boardRoutes from './routes/boardRoutes.js';

// Import middleware
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms/:roomId/chat', chatRoutes);
app.use('/api/rooms/:roomId/quiz', quizRoutes);
app.use('/api/rooms/:roomId/board', boardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error middleware
app.use(errorMiddleware);

export default app;
