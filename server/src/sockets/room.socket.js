// Room-specific Socket.IO events
const roomParticipants = new Map();

const getRoomParticipants = (roomId) => {
  if (!roomParticipants.has(roomId)) {
    roomParticipants.set(roomId, new Map());
  }
  return roomParticipants.get(roomId);
};

const buildParticipant = (socket, username) => ({
  socketId: socket.id,
  userId: socket.userId,
  username: username || socket.username || 'User',
  role: socket.role,
});

const buildSystemMessage = (content) => ({
  id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: 'system',
  messageType: 'system',
  username: 'System',
  content,
  timestamp: new Date(),
});

const removeParticipant = (socket, roomId) => {
  if (!roomId || !roomParticipants.has(roomId)) return null;

  const participants = roomParticipants.get(roomId);
  const participant = participants.get(socket.id);
  participants.delete(socket.id);

  if (participants.size === 0) {
    roomParticipants.delete(roomId);
  }

  return participant;
};

const setupRoomSocket = (socket, io) => {
  // Join room
  socket.on('room:join', ({ roomId, username }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    const participants = getRoomParticipants(roomId);
    const participant = buildParticipant(socket, username);
    participants.set(socket.id, participant);

    console.log(`✓ ${username} joined room ${roomId}`);

    // Notify others
    socket.to(roomId).emit('room:user-joined', {
      participant,
      timestamp: new Date(),
    });

    // Send confirmation
    socket.emit('room:joined', {
      roomId,
      userId: socket.userId,
      participants: Array.from(participants.values()),
    });
  });

  // Leave room
  socket.on('room:leave', ({ roomId, username }) => {
    socket.leave(roomId);
    const participant = removeParticipant(socket, roomId);
    const leavingUsername = username || participant?.username || socket.data.username || socket.username || 'A participant';
    socket.data.roomId = null;
    console.log(`✗ ${leavingUsername} left room ${roomId}`);

    // Notify others
    io.to(roomId).emit('room:user-left', {
      userId: socket.userId,
      socketId: socket.id,
      username: leavingUsername,
      timestamp: new Date(),
    });

    io.to(roomId).emit('chat:new-message', buildSystemMessage(`${leavingUsername} left the meeting.`));
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const participant = removeParticipant(socket, roomId);
    if (!roomId || !participant) return;

    socket.to(roomId).emit('room:user-left', {
      userId: participant.userId,
      socketId: participant.socketId,
      username: participant.username,
      timestamp: new Date(),
    });

    socket.to(roomId).emit('chat:new-message', buildSystemMessage(`${participant.username} left the meeting.`));
  });

  // Raise hand
  socket.on('room:raise-hand', ({ roomId, username }) => {
    io.to(roomId).emit('room:hand-raised', {
      userId: socket.userId,
      username,
      timestamp: new Date(),
    });
  });

  // Lower hand
  socket.on('room:lower-hand', ({ roomId, username }) => {
    io.to(roomId).emit('room:hand-lowered', {
      userId: socket.userId,
      username,
    });
  });

  // Update room status
  socket.on('room:status-update', ({ roomId, status }) => {
    io.to(roomId).emit('room:status-changed', {
      status,
      timestamp: new Date(),
    });
  });
};

export default setupRoomSocket;
