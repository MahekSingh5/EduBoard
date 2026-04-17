import apiClient from './apiClient';

export const quizService = {
  // Create quiz
  createQuiz: async (roomId, title, questions) => {
    const response = await apiClient.post(`/rooms/${roomId}/quiz`, {
      title,
      questions,
    });
    return response.data;
  },

  // Get quizzes
  getQuizzes: async (roomId) => {
    const response = await apiClient.get(`/rooms/${roomId}/quiz`);
    return response.data;
  },

  // Get quiz by ID
  getQuizById: async (roomId, quizId) => {
    const response = await apiClient.get(`/rooms/${roomId}/quiz/${quizId}`);
    return response.data;
  },

  // Submit quiz answers
  submitAnswers: async (roomId, quizId, answers) => {
    const response = await apiClient.post(
      `/rooms/${roomId}/quiz/${quizId}/submit`,
      { answers }
    );
    return response.data;
  },

  // Get quiz results
  getResults: async (roomId, quizId) => {
    const response = await apiClient.get(
      `/rooms/${roomId}/quiz/${quizId}/results`
    );
    return response.data;
  },
};
