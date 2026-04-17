import Quiz from '../models/Quiz.js';
import asyncHandler from 'express-async-handler';

// Create a new quiz
export const createQuiz = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { title, description, questions } = req.body;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ message: 'Title and questions are required' });
  }

  const quiz = await Quiz.create({
    room: roomId,
    creator: req.user.id,
    title,
    description,
    questions,
  });

  res.status(201).json({
    success: true,
    quiz,
  });
});

// Get all quizzes in a room
export const getQuizzes = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const quizzes = await Quiz.find({ room: roomId })
    .populate('creator', 'username')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    quizzes,
  });
});

// Get single quiz
export const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate('creator', 'username');

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  res.status(200).json({
    success: true,
    quiz,
  });
});

// Start quiz (teacher only)
export const startQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  let quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  if (quiz.creator.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only creator can start quiz' });
  }

  quiz.isActive = true;
  quiz.startTime = new Date();
  await quiz.save();

  res.status(200).json({
    success: true,
    quiz,
  });
});

// End quiz
export const endQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  let quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  if (quiz.creator.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only creator can end quiz' });
  }

  quiz.isActive = false;
  quiz.endTime = new Date();
  quiz.showResults = true;
  await quiz.save();

  res.status(200).json({
    success: true,
    quiz,
  });
});

// Submit quiz response
export const submitResponse = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;

  let quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  // Calculate score
  let score = 0;
  const evaluatedAnswers = answers.map((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId);
    const isCorrect = question.correctAnswer === answer.answer;
    if (isCorrect) score += question.points || 1;

    return {
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect,
    };
  });

  // Check if user already submitted
  let responseIndex = quiz.responses.findIndex((r) => r.userId.toString() === req.user.id);

  if (responseIndex !== -1) {
    quiz.responses[responseIndex] = {
      userId: req.user.id,
      answers: evaluatedAnswers,
      score,
      submittedAt: new Date(),
    };
  } else {
    quiz.responses.push({
      userId: req.user.id,
      answers: evaluatedAnswers,
      score,
      submittedAt: new Date(),
    });
  }

  await quiz.save();

  res.status(200).json({
    success: true,
    score,
    quiz,
  });
});

// Get quiz results
export const getResults = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId)
    .populate('responses.userId', 'username')
    .lean();

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  // Calculate statistics
  const totalResponses = quiz.responses.length;
  const scores = quiz.responses.map((r) => r.score);
  const avgScore = totalResponses > 0 ? scores.reduce((a, b) => a + b, 0) / totalResponses : 0;

  res.status(200).json({
    success: true,
    results: {
      quiz,
      statistics: {
        totalResponses,
        averageScore: avgScore.toFixed(2),
        maxScore: Math.max(...scores, 0),
        minScore: Math.min(...scores, 0),
      },
    },
  });
});
