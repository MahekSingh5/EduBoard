import express from 'express';
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  startQuiz,
  endQuiz,
  submitResponse,
  getResults,
} from '../controllers/quizController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router({ mergeParams: true });

// All routes need authentication
router.use(authMiddleware);

// Create quiz (teacher only)
router.post('/', roleMiddleware('teacher'), createQuiz);

// Get all quizzes in a room
router.get('/', getQuizzes);

// Get single quiz
router.get('/:quizId', getQuiz);

// Start quiz (teacher only)
router.post('/:quizId/start', roleMiddleware('teacher'), startQuiz);

// End quiz (teacher only)
router.post('/:quizId/end', roleMiddleware('teacher'), endQuiz);

// Submit student response
router.post('/:quizId/submit', submitResponse);

// Get quiz results
router.get('/:quizId/results', getResults);

export default router;
