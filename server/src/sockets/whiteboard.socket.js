// Whiteboard-specific Socket.IO events
const drawingPermissionsByRoom = new Map();

const getDrawingPermissions = (roomId) => {
  if (!drawingPermissionsByRoom.has(roomId)) {
    drawingPermissionsByRoom.set(roomId, new Set());
  }
  return drawingPermissionsByRoom.get(roomId);
};

const canUseWhiteboard = (socket, roomId) => (
  socket.role === 'teacher' || getDrawingPermissions(roomId).has(socket.userId)
);

const setupWhiteboardSocket = (socket, io) => {
  socket.on('permissions:request-drawing', ({ roomId }) => {
    if (socket.role !== 'student') return;

    socket.to(roomId).emit('permissions:request-drawing', {
      studentId: socket.userId,
      studentName: socket.username || 'Student',
      timestamp: new Date(),
    });
  });

  socket.on('permissions:grant-drawing', ({ roomId, studentId, studentName }) => {
    if (socket.role !== 'teacher') return;

    getDrawingPermissions(roomId).add(studentId);

    io.to(studentId).emit('permissions:drawing-granted', {
      roomId,
      studentId,
      studentName,
      teacherId: socket.userId,
      teacherName: socket.username,
      timestamp: new Date(),
    });

    socket.emit('permissions:drawing-granted', {
      roomId,
      studentId,
      studentName,
      timestamp: new Date(),
    });
  });

  socket.on('permissions:revoke-drawing', ({ roomId, studentId }) => {
    if (socket.role !== 'teacher') return;

    getDrawingPermissions(roomId).delete(studentId);

    io.to(studentId).emit('permissions:drawing-revoked', {
      roomId,
      studentId,
      teacherId: socket.userId,
      teacherName: socket.username,
      timestamp: new Date(),
    });

    socket.emit('permissions:drawing-revoked', {
      roomId,
      studentId,
      timestamp: new Date(),
    });
  });

  // Draw stroke
  socket.on('whiteboard:draw', ({ roomId, stroke }) => {
    if (!canUseWhiteboard(socket, roomId)) return;

    socket.to(roomId).emit('whiteboard:stroke-received', {
      userId: socket.userId,
      username: socket.username,
      stroke,
      timestamp: new Date(),
    });
  });

  // Clear canvas
  socket.on('whiteboard:clear', ({ roomId }) => {
    if (!canUseWhiteboard(socket, roomId)) return;

    io.to(roomId).emit('whiteboard:cleared', {
      userId: socket.userId,
      username: socket.username,
      timestamp: new Date(),
    });
  });

  // Undo action
  socket.on('whiteboard:undo', ({ roomId }) => {
    if (!canUseWhiteboard(socket, roomId)) return;

    io.to(roomId).emit('whiteboard:undo-action', {
      userId: socket.userId,
      username: socket.username,
    });
  });

  // Change color
  socket.on('whiteboard:color-change', ({ roomId, color }) => {
    if (!canUseWhiteboard(socket, roomId)) return;

    io.to(roomId).emit('whiteboard:color-changed', {
      color,
      userId: socket.userId,
    });
  });

  // Change brush size
  socket.on('whiteboard:brush-size-change', ({ roomId, size }) => {
    if (!canUseWhiteboard(socket, roomId)) return;

    io.to(roomId).emit('whiteboard:brush-size-changed', {
      size,
      userId: socket.userId,
    });
  });

  // Request full canvas state (for new users joining)
  socket.on('whiteboard:request-state', ({ roomId }) => {
    socket.to(roomId).emit('whiteboard:state-request', {
      userId: socket.userId,
    });
  });

  // Send full canvas state
  socket.on('whiteboard:send-state', ({ roomId, canvasData }) => {
    socket.to(roomId).emit('whiteboard:state-received', {
      canvasData,
      userId: socket.userId,
    });
  });

  // Save board snapshot
  socket.on('whiteboard:save-snapshot', ({ roomId, dataUrl }) => {
    io.to(roomId).emit('whiteboard:snapshot-saved', {
      dataUrl,
      userId: socket.userId,
      username: socket.username,
      timestamp: new Date(),
    });
  });
};

export default setupWhiteboardSocket;
