import Board from '../models/Board.js';
import asyncHandler from 'express-async-handler';

// Get board for a room
export const getBoard = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  let board = await Board.findOne({ room: roomId });

  if (!board) {
    board = await Board.create({
      room: roomId,
      title: 'Classroom Board',
    });
  }

  res.status(200).json({
    success: true,
    board,
  });
});

// Save canvas data
export const saveCanvas = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { canvasData } = req.body;

  if (!canvasData) {
    return res.status(400).json({ message: 'Canvas data is required' });
  }

  let board = await Board.findById(boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  board.canvasData = canvasData;

  // Add to history
  board.history.push({
    action: 'draw',
    data: canvasData,
    userId: req.user.id,
  });

  await board.save();

  res.status(200).json({
    success: true,
    board,
  });
});

// Clear board
export const clearBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  let board = await Board.findById(boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const previousData = board.canvasData;
  board.canvasData = JSON.stringify([]);

  // Add to history
  board.history.push({
    action: 'clear',
    data: previousData,
    userId: req.user.id,
  });

  await board.save();

  res.status(200).json({
    success: true,
    message: 'Board cleared',
    board,
  });
});

// Undo last action
export const undoAction = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  let board = await Board.findById(boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  if (board.history.length > 0) {
    const lastAction = board.history.pop();
    board.canvasData = lastAction.data;
  }

  await board.save();

  res.status(200).json({
    success: true,
    board,
  });
});

// Get board history
export const getHistory = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  const board = await Board.findById(boardId)
    .select('history')
    .populate('history.userId', 'username');

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  res.status(200).json({
    success: true,
    history: board.history,
  });
});

// Save board as thumbnail/snapshot
export const saveThumbnail = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { thumbnail } = req.body;

  let board = await Board.findById(boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  board.thumbnail = thumbnail; // Base64 string
  await board.save();

  res.status(200).json({
    success: true,
    message: 'Thumbnail saved',
  });
});
