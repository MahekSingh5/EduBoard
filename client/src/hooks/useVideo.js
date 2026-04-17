import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

const VIDEO_EVENTS = {
  CAMERA_ENABLED: 'video:cameraEnabled',
  CAMERA_DISABLED: 'video:cameraDisabled',
  OFFER: 'video:offer',
  ANSWER: 'video:answer',
  ICE_CANDIDATE: 'video:iceCandidate',
};

const createPeerConnection = () => new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
});

export const useVideo = (roomId, userId, userRole) => {
  const { socket } = useSocket();
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState(new Map());

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const pendingCandidatesRef = useRef(new Map());

  const closePeerConnection = useCallback((peerId) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
    pendingCandidatesRef.current.delete(peerId);
  }, []);

  const setupPeerConnection = useCallback((peerId) => {
    closePeerConnection(peerId);

    const pc = createPeerConnection();
    peerConnectionsRef.current.set(peerId, pc);

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      socket.emit(VIDEO_EVENTS.ICE_CANDIDATE, {
        roomId,
        from: userId,
        to: peerId,
        candidate: event.candidate.toJSON(),
      });
    };

    pc.ontrack = (event) => {
      if (!event.streams?.[0]) return;
      setRemoteStreams((prev) => new Map(prev).set(peerId, event.streams[0]));
    };

    return pc;
  }, [closePeerConnection, roomId, socket, userId]);

  const enableCamera = useCallback(async () => {
    if (!socket || userRole !== 'teacher') return;

    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      localStreamRef.current = stream;
      setIsCameraEnabled(true);

      socket.emit(VIDEO_EVENTS.CAMERA_ENABLED, {
        roomId,
        userId,
        username: socket.auth?.username,
      });
    } catch (err) {
      setError('Camera access denied. Please check browser permissions.');
      console.error('Error enabling camera:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, socket, userId, userRole]);

  const disableCamera = useCallback(() => {
    if (!socket) return;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();

    socket.emit(VIDEO_EVENTS.CAMERA_DISABLED, { roomId, userId });

    setIsCameraEnabled(false);
    setRemoteStreams(new Map());
  }, [roomId, socket, userId]);

  useEffect(() => {
    if (!socket) return;

    const handleCameraEnabled = async (data) => {
      if (data.userId === userId || userRole !== 'student') return;

      try {
        const pc = setupPeerConnection(data.userId);
        pc.addTransceiver('video', { direction: 'recvonly' });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit(VIDEO_EVENTS.OFFER, {
          roomId,
          from: userId,
          to: data.userId,
          offer: offer.toJSON(),
        });
      } catch (err) {
        console.error('Error requesting teacher camera:', err);
      }
    };

    const handleCameraDisabled = (data) => {
      closePeerConnection(data.userId);
      setRemoteStreams((prev) => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    };

    const handleOffer = async ({ from, offer }) => {
      if (userRole !== 'teacher' || !localStreamRef.current) return;

      try {
        const pc = setupPeerConnection(from);
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit(VIDEO_EVENTS.ANSWER, {
          roomId,
          from: userId,
          to: from,
          answer: answer.toJSON(),
        });

        const pending = pendingCandidatesRef.current.get(from) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current.delete(from);
      } catch (err) {
        console.error('Error answering camera request:', err);
      }
    };

    const handleAnswer = async ({ from, answer }) => {
      try {
        const pc = peerConnectionsRef.current.get(from);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        const pending = pendingCandidatesRef.current.get(from) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current.delete(from);
      } catch (err) {
        console.error('Error handling camera answer:', err);
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      try {
        const pc = peerConnectionsRef.current.get(from);
        if (!pc || !pc.remoteDescription) {
          pendingCandidatesRef.current.set(from, [
            ...(pendingCandidatesRef.current.get(from) || []),
            candidate,
          ]);
          return;
        }
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('Error adding camera ICE candidate:', err);
      }
    };

    socket.on(VIDEO_EVENTS.CAMERA_ENABLED, handleCameraEnabled);
    socket.on(VIDEO_EVENTS.CAMERA_DISABLED, handleCameraDisabled);
    socket.on(VIDEO_EVENTS.OFFER, handleOffer);
    socket.on(VIDEO_EVENTS.ANSWER, handleAnswer);
    socket.on(VIDEO_EVENTS.ICE_CANDIDATE, handleIceCandidate);

    return () => {
      socket.off(VIDEO_EVENTS.CAMERA_ENABLED, handleCameraEnabled);
      socket.off(VIDEO_EVENTS.CAMERA_DISABLED, handleCameraDisabled);
      socket.off(VIDEO_EVENTS.OFFER, handleOffer);
      socket.off(VIDEO_EVENTS.ANSWER, handleAnswer);
      socket.off(VIDEO_EVENTS.ICE_CANDIDATE, handleIceCandidate);
    };
  }, [closePeerConnection, roomId, setupPeerConnection, socket, userId, userRole]);

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionsRef.current.forEach((pc) => pc.close());
  }, []);

  return {
    isCameraEnabled,
    localStream: localStreamRef.current,
    remoteStreams,
    error,
    isLoading,
    enableCamera,
    disableCamera,
    getLocalStream: () => localStreamRef.current,
  };
};
