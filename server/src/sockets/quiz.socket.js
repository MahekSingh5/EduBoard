// Quiz-specific Socket.IO events
const setupQuizSocket = (socket, io) => {
  // Teacher creates a new question
  socket.on('quiz:new-question', ({ roomId, id, question, options, correctOption, timestamp }) => {
    console.log(`📝 New question in room ${roomId}:`, question);
    socket.to(roomId).emit('quiz:new-question', {
      id,
      question,
      options,
      correctOption,
      createdBy: socket.userId,
      timestamp,
    });
  });

  // Student submits answer
  socket.on('quiz:submit-answer', ({ questionId, userId, answer, isCorrect, timestamp }) => {
    console.log(`✓ Answer submitted by ${socket.username}: Option ${answer}`);
    // Broadcast that student answered (don't show answer yet)
    socket.broadcast.emit('quiz:answer-received', {
      userId,
      username: socket.username,
      timestamp,
    });
  });

  // Teacher shows results
  socket.on('quiz:show-results', ({ roomId, questionId, answers, correctOption }) => {
    console.log(`📊 Showing results for question ${questionId} in room ${roomId}`);
    io.to(roomId).emit('quiz:show-results', {
      questionId,
      answers,
      correctOption,
      timestamp: new Date(),
    });
  });

  // Start quiz
  socket.on('quiz:start', ({ roomId, quizId, quizTitle }) => {
    io.to(roomId).emit('quiz:started', {
      quizId,
      quizTitle,
      startTime: new Date(),
      message: 'Quiz has started!',
    });
    console.log(`📝 Quiz ${quizId} started in room ${roomId}`);
  });

  // Next question
  socket.on('quiz:next-question', ({ roomId, quizId, questionNumber, question }) => {
    io.to(roomId).emit('quiz:question-show', {
      questionNumber,
      question,
      timestamp: new Date(),
    });
  });

  // End quiz
  socket.on('quiz:end', ({ roomId, quizId }) => {
    io.to(roomId).emit('quiz:ended', {
      quizId,
      message: 'Quiz has ended',
      timestamp: new Date(),
    });
  });

  // Send question timer update
  socket.on('quiz:timer-update', ({ roomId, secondsLeft }) => {
    io.to(roomId).emit('quiz:time-remaining', {
      secondsLeft,
    });
  });

  // Broadcast answer statistics
  socket.on('quiz:answer-stats', ({ roomId, questionId, stats }) => {
    io.to(roomId).emit('quiz:stats-update', {
      questionId,
      stats,
    });
  });
};

export default setupQuizSocket;
