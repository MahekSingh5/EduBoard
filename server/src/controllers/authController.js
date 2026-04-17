import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';

// Register user
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Check if user already exists
  let user = await User.findOne({ $or: [{ email }, { username }] });
  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  user = await User.create({
    username,
    email,
    password,
    role: role || 'student',
  });

  // Generate token with user role
  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // Check for user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate token with user role
  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

// Get current user
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: user.toJSON(),
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, profilePicture } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { username, profilePicture },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    user: user.toJSON(),
  });
});
