// WebRTC and Screen Sharing Socket.IO events
const setupWebRTCSocket = (socket, io) => {
  // Request to share screen (teacher only)
  socket.on('webrtc:request-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('webrtc:screen-share-started', {
      teacherId: socket.userId,
      teacherName: socket.username,
      timestamp: new Date(),
    });
    console.log(`🖥️ Screen sharing started by ${socket.username} in room ${roomId}`);
  });

  // Stop screen sharing
  socket.on('webrtc:stop-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('webrtc:screen-share-stopped', {
      teacherId: socket.userId,
      timestamp: new Date(),
    });
    console.log(`🛑 Screen sharing stopped by ${socket.username} in room ${roomId}`);
  });

  // Send SDP offer
  socket.on('webrtc:send-offer', ({ roomId, to, offer }) => {
    if (to === 'all') {
      // Broadcast to all users in room
      socket.to(roomId).emit('webrtc:send-offer', {
        from: socket.userId,
        offer,
      });
      console.log(`📤 Offer sent to all in room ${roomId}`);
    } else {
      // Send to specific user
      io.to(to).emit('webrtc:send-offer', {
        from: socket.userId,
        offer,
      });
      console.log(`📤 Offer sent to ${to}`);
    }
  });

  // Send SDP answer
  socket.on('webrtc:send-answer', ({ roomId, to, answer }) => {
    io.to(to).emit('webrtc:send-answer', {
      from: socket.userId,
      answer,
    });
    console.log(`📥 Answer sent to ${to}`);
  });

  // Send ICE candidate
  socket.on('webrtc:send-ice-candidate', ({ roomId, to, candidate }) => {
    if (to === 'all' || to === 'all-teachers') {
      // Broadcast to all or all teachers
      socket.to(roomId).emit('webrtc:send-ice-candidate', {
        from: socket.userId,
        candidate,
      });
    } else if (to) {
      // Send to specific user
      io.to(to).emit('webrtc:send-ice-candidate', {
        from: socket.userId,
        candidate,
      });
    } else {
      // Broadcast to room
      socket.to(roomId).emit('webrtc:send-ice-candidate', {
        from: socket.userId,
        candidate,
      });
    }
  });

  // Handle ICE connection state
  socket.on('webrtc:connection-state-change', ({ roomId, state }) => {
    console.log(`🔗 WebRTC connection state: ${socket.username} - ${state}`);
  });
};

export default setupWebRTCSocket;
