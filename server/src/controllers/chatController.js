import Message from '../models/Message.js';
import Room from '../models/Room.js';
import asyncHandler from 'express-async-handler';

// Get all messages in a room
export const getMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const messages = await Message.find({ room: roomId })
    .populate('sender', 'username profilePicture role')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    messages: messages.reverse(),
  });
});

// Create a new message
export const createMessage = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { content, messageType } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  const message = await Message.create({
    room: roomId,
    sender: req.user.id,
    content,
    messageType: messageType || 'text',
  });

  const populatedMessage = await message.populate('sender', 'username profilePicture role');

  res.status(201).json({
    success: true,
    message: populatedMessage,
  });
});

// Edit message
export const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  let message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  if (message.sender.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to edit this message' });
  }

  message.content = content;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  await message.populate('sender', 'username profilePicture role');

  res.status(200).json({
    success: true,
    message,
  });
});

// Delete message
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  if (message.sender.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this message' });
  }

  await Message.findByIdAndDelete(messageId);

  res.status(200).json({
    success: true,
    message: 'Message deleted',
  });
});

// Add reaction to message
export const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  let message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  let reaction = message.reactions.find((r) => r.emoji === emoji);

  if (!reaction) {
    message.reactions.push({
      emoji,
      users: [req.user.id],
    });
  } else {
    if (!reaction.users.includes(req.user.id)) {
      reaction.users.push(req.user.id);
    }
  }

  await message.save();

  res.status(200).json({
    success: true,
    message,
  });
});
