/**
 * Audio Socket Handler
 * Manages microphone access permissions and WebRTC audio connections
 * Teacher can approve/reject student microphone requests
 */

export const setupAudioSocket = (io) => {
  // Microphone request - Student requests to speak
  io.on('connection', (socket) => {
    socket.on('audio:micRequest', (data) => {
      const { roomId, userId, username } = data;

      console.log(`[AUDIO] ${username} (${userId}) requested microphone access in room ${roomId}`);

      // Broadcast to all teachers in the room
      io.to(roomId).emit('audio:micRequest', {
        studentId: userId,
        username,
        timestamp: new Date(),
      });
    });

    // Teacher approves microphone
    socket.on('audio:micApproved', (data) => {
      const { roomId, studentId } = data;

      console.log(`[AUDIO] Teacher approved microphone for student ${studentId} in room ${roomId}`);

      // Send approval only to the student
      io.to(studentId).emit('audio:micApproved', {
        roomId,
        timestamp: new Date(),
      });

      // Notify everyone in room
      io.to(roomId).emit('audio:studentApprovedForMic', {
        studentId,
        timestamp: new Date(),
      });
    });

    // Teacher rejects microphone request
    socket.on('audio:micRejected', (data) => {
      const { roomId, studentId } = data;

      console.log(`[AUDIO] Teacher rejected microphone for student ${studentId} in room ${roomId}`);

      // Send rejection only to the student
      io.to(studentId).emit('audio:micRejected', {
        roomId,
        timestamp: new Date(),
      });
    });

    // Student enabled their microphone
    socket.on('audio:micEnabled', (data) => {
      const { roomId, userId, username } = data;

      console.log(`[AUDIO] ${username} (${userId}) enabled microphone in room ${roomId}`);

      // Notify everyone in room that user is now speaking
      io.to(roomId).emit('audio:micEnabled', {
        userId,
        username,
        timestamp: new Date(),
      });

      // Store user's audio state
      socket.join(`${roomId}:audio:${userId}`);
    });

    // Student disabled their microphone
    socket.on('audio:micDisabled', (data) => {
      const { roomId, userId } = data;

      console.log(`[AUDIO] User ${userId} disabled microphone in room ${roomId}`);

      // Notify everyone in room
      io.to(roomId).emit('audio:micDisabled', {
        userId,
        timestamp: new Date(),
      });

      // Leave audio broadcast room
      socket.leave(`${roomId}:audio:${userId}`);
    });

    // WebRTC Offer for audio peer connection
    socket.on('audio:offer', (data) => {
      const { roomId, from, to, offer } = data;

      console.log(`[AUDIO] Offer from ${from} to ${to} in room ${roomId}`);

      // Forward offer to the target user
      io.to(to).emit('audio:offer', {
        roomId,
        from,
        offer,
        timestamp: new Date(),
      });
    });

    // WebRTC Answer for audio peer connection
    socket.on('audio:answer', (data) => {
      const { roomId, from, to, answer } = data;

      console.log(`[AUDIO] Answer from ${from} to ${to} in room ${roomId}`);

      // Forward answer back to the initiator
      io.to(to).emit('audio:answer', {
        roomId,
        from,
        answer,
        timestamp: new Date(),
      });
    });

    // ICE Candidate for audio connection
    socket.on('audio:iceCandidate', (data) => {
      const { roomId, from, to, candidate } = data;

      console.log(`[AUDIO] ICE candidate from ${from} to ${to} in room ${roomId}`);

      // Forward ICE candidate to the target user
      io.to(to).emit('audio:iceCandidate', {
        roomId,
        from,
        candidate,
        timestamp: new Date(),
      });
    });
  });
};

export default setupAudioSocket;
