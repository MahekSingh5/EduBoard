// Reaction-specific Socket.IO events
const setupReactionSocket = (socket, io) => {
  // Send reaction
  socket.on('reaction:send', ({ roomId, emoji, username }) => {
    io.to(roomId).emit('reaction:received', {
      userId: socket.userId,
      username,
      emoji,
      timestamp: new Date(),
    });
    console.log(`😊 Reaction ${emoji} from ${username} in room ${roomId}`);
  });

  // Clear all reactions
  socket.on('reaction:clear-all', ({ roomId }) => {
    io.to(roomId).emit('reaction:cleared', {
      timestamp: new Date(),
    });
  });

  // Get reaction summary
  socket.on('reaction:get-summary', ({ roomId }) => {
    socket.emit('reaction:summary-request', {
      roomId,
    });
  });

  // Send reaction summary (e.g., from server cache)
  socket.on('reaction:send-summary', ({ roomId, summary }) => {
    io.to(roomId).emit('reaction:summary-update', {
      summary, // { '👍': 5, '❤️': 3, '😄': 2, etc. }
      timestamp: new Date(),
    });
  });
};

export default setupReactionSocket;
