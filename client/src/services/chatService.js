import apiClient from './apiClient';

export const chatService = {
  // Get room messages
  getMessages: async (roomId) => {
    const response = await apiClient.get(`/rooms/${roomId}/chat`);
    return response.data;
  },

  // Send message
  sendMessage: async (roomId, content) => {
    const response = await apiClient.post(`/rooms/${roomId}/chat`, {
      content,
    });
    return response.data;
  },

  // Edit message
  editMessage: async (roomId, messageId, content) => {
    const response = await apiClient.put(
      `/rooms/${roomId}/chat/${messageId}`,
      { content }
    );
    return response.data;
  },

  // Delete message
  deleteMessage: async (roomId, messageId) => {
    const response = await apiClient.delete(
      `/rooms/${roomId}/chat/${messageId}`
    );
    return response.data;
  },
};
