import apiClient from './apiClient';

export const roomService = {
  // Create a new room
  createRoom: async (name, description) => {
    const response = await apiClient.post('/rooms', {
      name,
      description,
    });
    return response.data;
  },

  // Get teacher's rooms
  getTeacherRooms: async () => {
    const response = await apiClient.get('/rooms/teacher/rooms');
    return response.data;
  },

  // Get room by code
  getRoomByCode: async (code) => {
    const response = await apiClient.get(`/rooms/code/${code}`);
    return response.data;
  },

  // Join room
  joinRoom: async (code) => {
    const response = await apiClient.post(`/rooms/${code}/join`);
    return response.data;
  },

  // Leave room
  leaveRoom: async (roomId) => {
    const response = await apiClient.post(`/rooms/${roomId}/leave`);
    return response.data;
  },
};
