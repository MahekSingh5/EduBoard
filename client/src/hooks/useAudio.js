import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import audioManager from '../utils/audioManager';

const AUDIO_EVENTS = {
  MIC_REQUEST: 'audio:micRequest',
  MIC_APPROVED: 'audio:micApproved',
  MIC_REJECTED: 'audio:micRejected',
  MIC_ENABLED: 'audio:micEnabled',
  MIC_DISABLED: 'audio:micDisabled',
  OFFER: 'audio:offer',
  ANSWER: 'audio:answer',
  ICE_CANDIDATE: 'audio:iceCandidate',
};

export const useAudio = (roomId, userId, userRole) => {
  const { socket } = useSocket();
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(userRole === 'teacher');
  const [micRequested, setMicRequested] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const peerConnectionsRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef(new Map());

  // Request microphone permission from teacher
  const requestMicAccess = useCallback(async () => {
    if (!socket || userRole === 'teacher') return;

    try {
      setIsLoading(true);
      socket.emit(AUDIO_EVENTS.MIC_REQUEST, {
        roomId,
        userId,
        username: socket.auth?.username,
      });
      setMicRequested(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [socket, roomId, userId, userRole]);

  // Teacher approves mic access
  const approveMicAccess = useCallback(
    (studentId) => {
      if (!socket || userRole !== 'teacher') return;

      socket.emit(AUDIO_EVENTS.MIC_APPROVED, {
        roomId,
        studentId,
      });
    },
    [socket, roomId, userRole]
  );

  // Teacher rejects mic access
  const rejectMicAccess = useCallback(
    (studentId) => {
      if (!socket || userRole !== 'teacher') return;

      socket.emit(AUDIO_EVENTS.MIC_REJECTED, {
        roomId,
        studentId,
      });
    },
    [socket, roomId, userRole]
  );

  // Enable microphone
  const enableMic = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await audioManager.getAudioStream();
      localStreamRef.current = stream;

      // Notify others that mic is enabled
      socket.emit(AUDIO_EVENTS.MIC_ENABLED, {
        roomId,
        userId,
        username: socket.auth?.username,
      });

      setIsMicEnabled(true);
    } catch (err) {
      setError(err.message);
      console.error('Error enabling mic:', err);
    } finally {
      setIsLoading(false);
    }
  }, [socket, roomId, userId]);

  // Disable microphone
  const disableMic = useCallback(() => {
    audioManager.stopAudioStream();
    localStreamRef.current = null;

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => {
      audioManager.closePeerConnection(pc);
    });
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();

    socket.emit(AUDIO_EVENTS.MIC_DISABLED, {
      roomId,
      userId,
    });

    setIsMicEnabled(false);
    setRemoteStreams(new Map());
  }, [socket, roomId, userId]);

  // Handle incoming mic request (teacher only)
  useEffect(() => {
    if (!socket) return;

    socket.on(AUDIO_EVENTS.MIC_REQUEST, (data) => {
      console.log('Mic request from student:', data);
    });

    return () => {
      socket.off(AUDIO_EVENTS.MIC_REQUEST);
    };
  }, [socket]);

  // Handle mic approval (student)
  useEffect(() => {
    if (!socket || userRole === 'teacher') return;

    socket.on(AUDIO_EVENTS.MIC_APPROVED, async () => {
      console.log('Mic access approved');
      setHasMicPermission(true);
      try {
        await enableMic();
      } catch (err) {
        setError('Failed to enable microphone');
      }
    });

    return () => {
      socket.off(AUDIO_EVENTS.MIC_APPROVED);
    };
  }, [socket, userRole, enableMic]);

  // Handle mic rejection
  useEffect(() => {
    if (!socket) return;

    socket.on(AUDIO_EVENTS.MIC_REJECTED, () => {
      console.log('Mic access rejected');
      setHasMicPermission(false);
      setMicRequested(false);
      setError('Your microphone request was rejected');
    });

    return () => {
      socket.off(AUDIO_EVENTS.MIC_REJECTED);
    };
  }, [socket]);

  // Handle remote mic enabled
  useEffect(() => {
    if (!socket) return;

    socket.on(AUDIO_EVENTS.MIC_ENABLED, async (data) => {
      const { userId: remoteUserId } = data;
      if (remoteUserId === userId) return;
      console.log('Remote user enabled mic:', remoteUserId);

      try {
        // Create peer connection for this user
        const peerConnection = audioManager.createPeerConnection();
        peerConnectionsRef.current.set(remoteUserId, peerConnection);

        // Add local stream
        if (localStreamRef.current) {
          audioManager.addLocalStreamToPeer(peerConnection, localStreamRef.current);
        } else {
          peerConnection.addTransceiver('audio', { direction: 'recvonly' });
        }

        // Handle ice candidates
        audioManager.onIceCandidate(peerConnection, (candidate) => {
          socket.emit(AUDIO_EVENTS.ICE_CANDIDATE, {
            roomId,
            from: userId,
            to: remoteUserId,
            candidate,
          });
        });

        // Handle remote stream
        audioManager.onRemoteStream(peerConnection, (stream) => {
          setRemoteStreams((prev) => new Map(prev).set(remoteUserId, stream));
        });

        // Create offer
        const offer = await audioManager.createOffer(peerConnection);
        socket.emit(AUDIO_EVENTS.OFFER, {
          roomId,
          from: userId,
          to: remoteUserId,
          offer,
        });
      } catch (err) {
        console.error('Error creating peer connection:', err);
      }
    });

    return () => {
      socket.off(AUDIO_EVENTS.MIC_ENABLED);
    };
  }, [socket, roomId, userId]);

  // Handle offer
  useEffect(() => {
    if (!socket) return;

    socket.on(AUDIO_EVENTS.OFFER, async (data) => {
      const { from, offer } = data;

      try {
        let peerConnection = peerConnectionsRef.current.get(from);

        if (!peerConnection) {
          peerConnection = audioManager.createPeerConnection();
          peerConnectionsRef.current.set(from, peerConnection);

          if (localStreamRef.current) {
            audioManager.addLocalStreamToPeer(peerConnection, localStreamRef.current);
          } else {
            peerConnection.addTransceiver('audio', { direction: 'recvonly' });
          }

          audioManager.onIceCandidate(peerConnection, (candidate) => {
            socket.emit(AUDIO_EVENTS.ICE_CANDIDATE, {
              roomId,
              from: userId,
              to: from,
              candidate,
            });
          });

          audioManager.onRemoteStream(peerConnection, (stream) => {
            setRemoteStreams((prev) => new Map(prev).set(from, stream));
          });
        }

        await audioManager.setRemoteDescription(peerConnection, offer);
        const answer = await audioManager.createAnswer(peerConnection);

        socket.emit(AUDIO_EVENTS.ANSWER, {
          roomId,
          from: userId,
          to: from,
          answer,
        });

        const pending = pendingCandidatesRef.current.get(from) || [];
        for (const candidate of pending) {
          await audioManager.addIceCandidate(peerConnection, candidate);
        }
        pendingCandidatesRef.current.delete(from);
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    return () => {
      socket.off(AUDIO_EVENTS.OFFER);
    };
  }, [socket, roomId, userId]);

  // Handle answer
  useEffect(() => {
    if (!socket) return;

    socket.on(AUDIO_EVENTS.ANSWER, async (data) => {
      const { from, answer } = data;

      try {
        const peerConnection = peerConnectionsRef.current.get(from);
        if (peerConnection) {
          await audioManager.setRemoteDescription(peerConnection, answer);
          const pending = pendingCandidatesRef.current.get(from) || [];
          for (const candidate of pending) {
            await audioManager.addIceCandidate(peerConnection, candidate);
          }
          pendingCandidatesRef.current.delete(from);
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    return () => {
      socket.off(AUDIO_EVENTS.ANSWER);
    };
  }, [socket]);

  // Handle ICE candidates
  useEffect(() => {
    if (!socket) return;

    socket.on(AUDIO_EVENTS.ICE_CANDIDATE, async (data) => {
      const { from, candidate } = data;

      try {
        const peerConnection = peerConnectionsRef.current.get(from);
        if (!peerConnection || !peerConnection.remoteDescription) {
          pendingCandidatesRef.current.set(from, [
            ...(pendingCandidatesRef.current.get(from) || []),
            candidate,
          ]);
          return;
        }
        if (candidate) {
          await audioManager.addIceCandidate(peerConnection, candidate);
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    return () => {
      socket.off(AUDIO_EVENTS.ICE_CANDIDATE);
    };
  }, [socket]);

  // Handle remote mic disabled
  useEffect(() => {
    if (!socket) return;

    socket.on(AUDIO_EVENTS.MIC_DISABLED, (data) => {
      const { userId: remoteUserId } = data;
      console.log('Remote user disabled mic:', remoteUserId);

      const peerConnection = peerConnectionsRef.current.get(remoteUserId);
      if (peerConnection) {
        audioManager.closePeerConnection(peerConnection);
        peerConnectionsRef.current.delete(remoteUserId);
      }

      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.delete(remoteUserId);
        return newMap;
      });
    });

    return () => {
      socket.off(AUDIO_EVENTS.MIC_DISABLED);
    };
  }, [socket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (isMicEnabled) {
        disableMic();
      }
    };
  }, []);

  return {
    isMicEnabled,
    hasMicPermission,
    micRequested,
    remoteStreams,
    error,
    isLoading,
    enableMic,
    disableMic,
    requestMicAccess,
    approveMicAccess,
    rejectMicAccess,
  };
};
