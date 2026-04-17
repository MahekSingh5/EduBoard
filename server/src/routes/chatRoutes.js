import express from 'express';
import {
  getMessages,
  createMessage,
  editMessage,
  deleteMessage,
  addReaction,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// All routes need authentication
router.use(authMiddleware);

// Get all messages in a room
router.get('/messages', getMessages);

// Create message
router.post('/messages', createMessage);

// Edit message
router.put('/messages/:messageId', editMessage);

// Delete message
router.delete('/messages/:messageId', deleteMessage);

// Add reaction to message
router.post('/messages/:messageId/reaction', addReaction);

export default router;
