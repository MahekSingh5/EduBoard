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
const allowedOrigins = new Set(env.CORS_ORIGINS || [env.CORS_ORIGIN]);

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools like curl/postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
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
