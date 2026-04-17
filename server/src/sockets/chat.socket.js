// Chat-specific Socket.IO events
const setupChatSocket = (socket, io) => {
  // Send message
  socket.on('chat:send-message', ({ roomId, message, username, avatar }) => {
    const messageData = {
      id: `${socket.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: socket.userId,
      username,
      avatar,
      content: message,
      timestamp: new Date(),
    };

    io.to(roomId).emit('chat:new-message', messageData);
    console.log(`💬 Message from ${username} in room ${roomId}`);
  });

  // Typing indicator
  socket.on('chat:typing', ({ roomId, username }) => {
    socket.to(roomId).emit('chat:user-typing', { username });
  });

  // Stop typing
  socket.on('chat:stop-typing', ({ roomId, username }) => {
    socket.to(roomId).emit('chat:user-stop-typing', { username });
  });

  // Edit message
  socket.on('chat:edit-message', ({ roomId, messageId, newContent, username }) => {
    io.to(roomId).emit('chat:message-edited', {
      messageId,
      newContent,
      username,
      editedAt: new Date(),
    });
  });

  // Delete message
  socket.on('chat:delete-message', ({ roomId, messageId, username }) => {
    io.to(roomId).emit('chat:message-deleted', {
      messageId,
      username,
    });
  });

  // Message reaction
  socket.on('chat:add-reaction', ({ roomId, messageId, emoji, username }) => {
    io.to(roomId).emit('chat:reaction-added', {
      messageId,
      emoji,
      userId: socket.userId,
      username,
    });
  });

  // File upload (can be extended for actual file handling)
  socket.on('chat:file-shared', ({ roomId, fileName, fileSize, username }) => {
    io.to(roomId).emit('chat:file-received', {
      fileName,
      fileSize,
      username,
      timestamp: new Date(),
    });
  });
};

export default setupChatSocket;
