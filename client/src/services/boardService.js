import apiClient from './apiClient';

export const boardService = {
  // Get board state
  getBoardState: async (roomId) => {
    const response = await apiClient.get(`/rooms/${roomId}/board`);
    return response.data;
  },

  // Save drawing
  saveDrawing: async (roomId, drawing) => {
    const response = await apiClient.post(`/rooms/${roomId}/board`, {
      drawing,
    });
    return response.data;
  },

  // Clear board
  clearBoard: async (roomId) => {
    const response = await apiClient.delete(`/rooms/${roomId}/board`);
    return response.data;
  },
};
