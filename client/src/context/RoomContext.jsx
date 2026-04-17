import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

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
        const response = await axios.post(
          '/api/rooms',
          { name, description, maxStudents },
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        const response = await axios.post(
          `/api/rooms/${roomCode}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        await axios.post(
          `/api/rooms/${roomId}/leave`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
      const response = await axios.get('/api/rooms/teacher/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
