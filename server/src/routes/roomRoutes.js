import express from 'express';
import {
  createRoom,
  getTeacherRooms,
  getRoomByCode,
  joinRoom,
  leaveRoom,
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes need authentication
router.use(authMiddleware);

// Create room (teacher only)
router.post('/', roleMiddleware('teacher'), createRoom);

// Get teacher's rooms
router.get('/teacher/rooms', roleMiddleware('teacher'), getTeacherRooms);

// Get room by code
router.get('/code/:code', getRoomByCode);

// Join room (student)
router.post('/:code/join', joinRoom);

// Leave room
router.post('/:roomId/leave', leaveRoom);

export default router;
