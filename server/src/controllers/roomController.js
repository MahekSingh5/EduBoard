import Room from '../models/Room.js';
import User from '../models/User.js';
import Board from '../models/Board.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';
import asyncHandler from 'express-async-handler';

// Create a new room
export const createRoom = asyncHandler(async (req, res) => {
  const { name, description, maxStudents } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Room name is required' });
  }

  const code = generateRoomCode();

  const room = await Room.create({
    code,
    name,
    description,
    maxStudents: maxStudents || 50,
    teacher: req.user.id,
  });

  // Create associated board
  await Board.create({
    room: room._id,
  });

  res.status(201).json({
    success: true,
    room,
  });
});

// Get all rooms for teacher
export const getTeacherRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ teacher: req.user.id }).populate('teacher', 'username email');

  res.status(200).json({
    success: true,
    rooms,
  });
});

// Get room by code
export const getRoomByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const room = await Room.findOne({ code }).populate('teacher', 'username email').populate('students', 'username email role');

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  res.status(200).json({
    success: true,
    room,
  });
});

// Join room as student
export const joinRoom = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const room = await Room.findOne({ code });
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  // Check if student is already in room
  if (room.students.includes(req.user.id)) {
    return res.status(200).json({ success: true, room, message: 'Already in room' });
  }

  // Check max students
  if (room.students.length >= room.maxStudents) {
    return res.status(400).json({ message: 'Room is full' });
  }

  room.students.push(req.user.id);
  await room.save();

  res.status(200).json({
    success: true,
    room,
  });
});

// Leave room
export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findByIdAndUpdate(
    roomId,
    { $pull: { students: req.user.id } },
    { new: true }
  );

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Left room successfully',
  });
});

// Get room details
export const getRoomDetails = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId)
    .populate('teacher', 'username email')
    .populate('students', 'username email profilePicture');

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  res.status(200).json({
    success: true,
    room,
  });
});

// Update room (teacher only)
export const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { name, description, isActive, maxStudents } = req.body;

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.teacher.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only teacher can update room' });
  }

  room.name = name || room.name;
  room.description = description || room.description;
  room.isActive = isActive !== undefined ? isActive : room.isActive;
  room.maxStudents = maxStudents || room.maxStudents;

  await room.save();

  res.status(200).json({
    success: true,
    room,
  });
});

// Delete room (teacher only)
export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.teacher.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only teacher can delete room' });
  }

  // Delete associated board
  await Board.deleteOne({ room: roomId });
  
  await Room.findByIdAndDelete(roomId);

  res.status(200).json({
    success: true,
    message: 'Room deleted successfully',
  });
});
