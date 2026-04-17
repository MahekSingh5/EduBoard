import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export const useReactions = (roomId) => {
  const { emit, on, off } = useSocket();
  const [reactionCounts, setReactionCounts] = useState({});

  useEffect(() => {
    on(SOCKET_EVENTS.REACTION_RECEIVED, ({ emoji, userId, username }) => {
      setReactionCounts((prev) => {
        const count = prev[emoji] || [];
        return {
          ...prev,
          [emoji]: count.includes(userId) ? count : [...count, userId],
        };
      });
    });

    return () => {
      off(SOCKET_EVENTS.REACTION_RECEIVED);
    };
  }, [on, off]);

  const sendReaction = useCallback((emoji, username) => {
    emit(SOCKET_EVENTS.REACTION_SEND, { roomId, emoji, username });
  }, [emit, roomId]);

  return {
    reactionCounts,
    sendReaction,
  };
};
