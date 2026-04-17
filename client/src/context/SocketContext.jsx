import React, { createContext, useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children, token, userId, username, role }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    if (!token || !userId) return;

    // Connect to server on port 5001 by default
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl, {
      auth: {
        token,
        userId,
        username,
        role,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✓ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, userId, username, role]);

  const value = {
    socket,
    isConnected,
    currentRoom,
    setCurrentRoom,
    joinRoom: useCallback((roomId) => {
      if (socket) {
        socket.emit('room:join', { roomId });
        setCurrentRoom(roomId);
      }
    }, [socket]),
    leaveRoom: useCallback((roomId) => {
      if (socket) {
        socket.emit('room:leave', { roomId });
        setCurrentRoom(null);
      }
    }, [socket]),
    emit: useCallback((event, data) => {
      if (socket) {
        console.log(`📤 Emitting event: ${event}`, data);
        socket.emit(event, data);
      } else {
        console.warn(`⚠️ Socket not connected, cannot emit: ${event}`);
      }
    }, [socket]),
    on: useCallback((event, callback) => {
      if (socket) socket.on(event, callback);
    }, [socket]),
    off: useCallback((event, callback) => {
      if (socket) socket.off(event, callback);
    }, [socket]),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
