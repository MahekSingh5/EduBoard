import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export const useQuiz = (roomId, token) => {
  const { emit, on, off } = useSocket();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/rooms/${roomId}/quiz`);
        setQuizzes(response.data.quizzes);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [roomId, token]);

  // Socket listeners
  useEffect(() => {
    on(SOCKET_EVENTS.QUIZ_STARTED, ({ quizId }) => {
      const quiz = quizzes.find((q) => q._id === quizId);
      if (quiz) setCurrentQuiz(quiz);
    });

    on(SOCKET_EVENTS.QUIZ_QUESTION_SHOW, (data) => {
      if (currentQuiz) {
        setCurrentQuiz({ ...currentQuiz, currentQuestion: data });
      }
    });

    on(SOCKET_EVENTS.QUIZ_TIME_REMAINING, ({ secondsLeft }) => {
      setTimeRemaining(secondsLeft);
    });

    on(SOCKET_EVENTS.QUIZ_ENDED, () => {
      setCurrentQuiz(null);
      setTimeRemaining(0);
    });

    return () => {
      off(SOCKET_EVENTS.QUIZ_STARTED);
      off(SOCKET_EVENTS.QUIZ_QUESTION_SHOW);
      off(SOCKET_EVENTS.QUIZ_TIME_REMAINING);
      off(SOCKET_EVENTS.QUIZ_ENDED);
    };
  }, [on, off, currentQuiz]);

  const createQuiz = useCallback(async (quizData) => {
    try {
      const response = await apiClient.post(`/rooms/${roomId}/quiz`, quizData);
      setQuizzes([...quizzes, response.data.quiz]);
      return response.data.quiz;
    } catch (error) {
      console.error('Failed to create quiz:', error);
      throw error;
    }
  }, [roomId, token, quizzes]);

  const startQuiz = useCallback((quizId, quizTitle) => {
    emit(SOCKET_EVENTS.QUIZ_START, { roomId, quizId, quizTitle });
  }, [emit, roomId]);

  const submitAnswer = useCallback((answers, username) => {
    if (!currentQuiz) return;
    emit(SOCKET_EVENTS.QUIZ_SUBMIT_ANSWER, {
      roomId,
      quizId: currentQuiz._id,
      answers,
      username,
    });
  }, [emit, roomId, currentQuiz]);

  const endQuiz = useCallback((quizId) => {
    emit(SOCKET_EVENTS.QUIZ_END, { roomId, quizId });
  }, [emit, roomId]);

  return {
    quizzes,
    currentQuiz,
    loading,
    timeRemaining,
    createQuiz,
    startQuiz,
    submitAnswer,
    endQuiz,
  };
};
