// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Username validation
export const isValidUsername = (username) => {
  return username && username.length >= 3 && username.length <= 20;
};

// Room code validation
export const isValidRoomCode = (code) => {
  return code && code.length >= 4;
};

// Quiz question validation
export const isValidQuestion = (question) => {
  return (
    question.text &&
    question.text.trim().length > 0 &&
    question.options &&
    question.options.length >= 2 &&
    question.options.every((opt) => opt.trim().length > 0) &&
    question.correctAnswer !== undefined
  );
};

// Validate form data
export const validateRegistration = (data) => {
  const errors = {};

  if (!isValidUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters';
  }
  if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address';
  }
  if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  if (!data.role) {
    errors.role = 'Please select a role';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateLogin = (data) => {
  const errors = {};

  if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address';
  }
  if (!data.password) {
    errors.password = 'Password is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateRoomCreation = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Room name is required';
  }
  if (data.name && data.name.length > 100) {
    errors.name = 'Room name cannot exceed 100 characters';
  }
  if (data.description && data.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateQuiz = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Quiz title is required';
  }
  if (!data.questions || data.questions.length === 0) {
    errors.questions = 'At least one question is required';
  }
  if (data.questions && !data.questions.every(isValidQuestion)) {
    errors.questions = 'All questions must be valid';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
