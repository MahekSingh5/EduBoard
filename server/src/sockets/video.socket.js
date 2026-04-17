/**
 * Video Socket Handler
 * Manages camera access and WebRTC video connections
 * Teacher can broadcast camera to all students
 */

export const setupVideoSocket = (io) => {
  io.on('connection', (socket) => {
    // Teacher enables camera - broadcast to all in room
    socket.on('video:cameraEnabled', (data) => {
      const { roomId, userId, username } = data;

      console.log(`[VIDEO] ${username} (${userId}) enabled camera in room ${roomId}`);

      // Notify everyone in room that teacher camera is on
      io.to(roomId).emit('video:cameraEnabled', {
        userId,
        username,
        timestamp: new Date(),
      });
    });

    // Teacher disables camera
    socket.on('video:cameraDisabled', (data) => {
      const { roomId, userId } = data;

      console.log(`[VIDEO] User ${userId} disabled camera in room ${roomId}`);

      // Notify everyone in room
      io.to(roomId).emit('video:cameraDisabled', {
        userId,
        timestamp: new Date(),
      });
    });

    // WebRTC Offer for video peer connection
    socket.on('video:offer', (data) => {
      const { roomId, from, to, offer } = data;

      console.log(`[VIDEO] Offer from ${from} to ${to} in room ${roomId}`);

      if (to === 'all') {
        // Broadcast offer to all users in room
        socket.to(roomId).emit('video:offer', {
          roomId,
          from,
          offer,
          timestamp: new Date(),
        });
      } else {
        // Send to specific user
        io.to(to).emit('video:offer', {
          roomId,
          from,
          offer,
          timestamp: new Date(),
        });
      }
    });

    // WebRTC Answer for video peer connection
    socket.on('video:answer', (data) => {
      const { roomId, from, to, answer } = data;

      console.log(`[VIDEO] Answer from ${from} to ${to} in room ${roomId}`);

      // Forward answer back to the initiator
      io.to(to).emit('video:answer', {
        roomId,
        from,
        answer,
        timestamp: new Date(),
      });
    });

    // ICE Candidate for video connection
    socket.on('video:iceCandidate', (data) => {
      const { roomId, from, to, candidate } = data;

      console.log(`[VIDEO] ICE candidate from ${from} to ${to} in room ${roomId}`);

      // Forward ICE candidate to the target user
      io.to(to).emit('video:iceCandidate', {
        roomId,
        from,
        candidate,
        timestamp: new Date(),
      });
    });
  });
};

export default setupVideoSocket;
