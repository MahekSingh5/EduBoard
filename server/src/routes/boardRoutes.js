import express from 'express';
import {
  getBoard,
  saveCanvas,
  clearBoard,
  undoAction,
  getHistory,
  saveThumbnail,
} from '../controllers/boardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// All routes need authentication
router.use(authMiddleware);

// Get board for a room
router.get('/', getBoard);

// Save canvas data
router.post('/:boardId/save', saveCanvas);

// Clear board
router.post('/:boardId/clear', clearBoard);

// Undo last action
router.post('/:boardId/undo', undoAction);

// Get board history
router.get('/:boardId/history', getHistory);

// Save thumbnail
router.post('/:boardId/thumbnail', saveThumbnail);

export default router;
