import React, { createContext, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

export const RoomContext = createContext();

export const RoomProvider = ({ children, token }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRoom = useCallback(
    async (name, description, maxStudents = 50) => {
      setLoading(true);
      try {
        const response = await apiClient.post('/rooms', { name, description, maxStudents });
        return response.data.room;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create room');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const joinRoom = useCallback(
    async (roomCode) => {
      setLoading(true);
      try {
        const response = await apiClient.post(`/rooms/${roomCode}/join`, {});
        setCurrentRoom(response.data.room);
        return response.data.room;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to join room');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const leaveRoom = useCallback(
    async (roomId) => {
      setLoading(true);
      try {
        await apiClient.post(`/rooms/${roomId}/leave`, {});
        setCurrentRoom(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to leave room');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getTeacherRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/rooms/teacher/rooms');
      setRooms(response.data.rooms);
      return response.data.rooms;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const value = {
    currentRoom,
    rooms,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    getTeacherRooms,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
