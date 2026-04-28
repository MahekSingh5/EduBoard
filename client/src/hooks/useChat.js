import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export const useChat = (roomId, token) => {
  const { emit, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/rooms/${roomId}/chat/messages`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [roomId, token]);

  // Socket event listeners
  useEffect(() => {
    on(SOCKET_EVENTS.CHAT_NEW_MESSAGE, (data) => {
      setMessages((prev) => [...prev, data]);
    });

    on(SOCKET_EVENTS.CHAT_USER_TYPING, ({ username }) => {
      setTypingUsers((prev) => (prev.includes(username) ? prev : [...prev, username]));
    });

    on(SOCKET_EVENTS.CHAT_USER_STOP_TYPING, ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });

    on(SOCKET_EVENTS.CHAT_MESSAGE_EDITED, ({ messageId, newContent }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg))
      );
    });

    on(SOCKET_EVENTS.CHAT_MESSAGE_DELETED, ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    });

    on(SOCKET_EVENTS.CHAT_REACTION_ADDED, ({ messageId, emoji, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: [...(msg.reactions || []), { emoji, userId }],
              }
            : msg
        )
      );
    });

    on(SOCKET_EVENTS.ROOM_USER_LEFT, ({ username }) => {
      if (!username) return;
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });

    return () => {
      off(SOCKET_EVENTS.CHAT_NEW_MESSAGE);
      off(SOCKET_EVENTS.CHAT_USER_TYPING);
      off(SOCKET_EVENTS.CHAT_USER_STOP_TYPING);
      off(SOCKET_EVENTS.CHAT_MESSAGE_EDITED);
      off(SOCKET_EVENTS.CHAT_MESSAGE_DELETED);
      off(SOCKET_EVENTS.CHAT_REACTION_ADDED);
      off(SOCKET_EVENTS.ROOM_USER_LEFT);
    };
  }, [on, off]);

  const sendMessage = useCallback((message, username, avatar) => {
    console.log(`💬 Sending message in room ${roomId}:`, { message, username, avatar });
    if (!roomId) {
      console.error('❌ Cannot send message: roomId is empty');
      return;
    }
    emit(SOCKET_EVENTS.CHAT_SEND_MESSAGE, { roomId, message, username, avatar });
  }, [emit, roomId]);

  const editMessage = useCallback((messageId, newContent, username) => {
    emit(SOCKET_EVENTS.CHAT_EDIT_MESSAGE, { roomId, messageId, newContent, username });
  }, [emit, roomId]);

  const deleteMessage = useCallback((messageId, username) => {
    emit(SOCKET_EVENTS.CHAT_DELETE_MESSAGE, { roomId, messageId, username });
  }, [emit, roomId]);

  const addReaction = useCallback((messageId, emoji, username) => {
    emit(SOCKET_EVENTS.CHAT_ADD_REACTION, { roomId, messageId, emoji, username });
  }, [emit, roomId]);

  const setTyping = useCallback((username) => {
    emit(SOCKET_EVENTS.CHAT_TYPING, { roomId, username });
  }, [emit, roomId]);

  const stopTyping = useCallback((username) => {
    emit(SOCKET_EVENTS.CHAT_STOP_TYPING, { roomId, username });
  }, [emit, roomId]);

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    setTyping,
    stopTyping,
  };
};
