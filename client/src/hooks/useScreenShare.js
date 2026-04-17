import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';

const createPeerConnection = () => new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
});

export const useScreenShare = (roomId, userId, isTeacher) => {
  const { emit, on, off } = useSocket();
  const [isSharing, setIsSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [error, setError] = useState(null);

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
      emit(SOCKET_EVENTS.WEBRTC_SEND_ICE_CANDIDATE, {
        roomId,
        to: peerId,
        candidate: event.candidate.toJSON(),
      });
    };

    pc.ontrack = (event) => {
      if (!event.streams?.[0]) return;
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError('Screen share connection lost');
      }
    };

    return pc;
  }, [closePeerConnection, emit, roomId]);

  const stopScreenShare = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();

    setIsSharing(false);
    setIsScreenActive(false);
    setRemoteStream(null);

    emit(SOCKET_EVENTS.WEBRTC_STOP_SCREEN_SHARE, { roomId });
  }, [emit, roomId]);

  const startScreenShare = useCallback(async () => {
    if (!isTeacher) {
      setError('Only teachers can share screen');
      return;
    }

    try {
      setError(null);

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });

      localStreamRef.current = displayStream;
      setIsSharing(true);
      setIsScreenActive(true);

      displayStream.getTracks().forEach((track) => {
        track.onended = () => {
          if (displayStream.getTracks().every((t) => t.readyState === 'ended')) {
            stopScreenShare();
          }
        };
      });

      emit(SOCKET_EVENTS.WEBRTC_REQUEST_SCREEN_SHARE, { roomId });
    } catch (err) {
      console.error('Screen share error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Screen capture was cancelled');
      } else if (err.name === 'NotFoundError') {
        setError('No screen sharing capability found');
      } else {
        setError(err.message || 'Failed to start screen sharing');
      }
      setIsSharing(false);
      setIsScreenActive(false);
    }
  }, [emit, isTeacher, roomId, stopScreenShare]);

  useEffect(() => {
    if (isTeacher) return;

    const handleScreenStarted = async ({ teacherId }) => {
      try {
        setError(null);
        setIsScreenActive(true);

        const pc = setupPeerConnection(teacherId);
        pc.addTransceiver('video', { direction: 'recvonly' });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        emit(SOCKET_EVENTS.WEBRTC_SEND_OFFER, {
          roomId,
          to: teacherId,
          offer: offer.toJSON(),
        });
      } catch (err) {
        console.error('Error requesting screen share:', err);
        setError('Failed to connect to screen share');
      }
    };

    on(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STARTED, handleScreenStarted);
    return () => off(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STARTED, handleScreenStarted);
  }, [emit, isTeacher, on, off, roomId, setupPeerConnection]);

  useEffect(() => {
    const handleOffer = async ({ from, offer }) => {
      if (!isTeacher || !localStreamRef.current) return;

      try {
        const pc = setupPeerConnection(from);
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        emit(SOCKET_EVENTS.WEBRTC_SEND_ANSWER, {
          roomId,
          to: from,
          answer: answer.toJSON(),
        });

        const pending = pendingCandidatesRef.current.get(from) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current.delete(from);
      } catch (err) {
        console.error('Error answering screen share request:', err);
      }
    };

    on(SOCKET_EVENTS.WEBRTC_SEND_OFFER, handleOffer);
    return () => off(SOCKET_EVENTS.WEBRTC_SEND_OFFER, handleOffer);
  }, [emit, isTeacher, on, off, roomId, setupPeerConnection]);

  useEffect(() => {
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
        console.error('Error handling screen share answer:', err);
        setError('Failed to establish screen share connection');
      }
    };

    on(SOCKET_EVENTS.WEBRTC_SEND_ANSWER, handleAnswer);
    return () => off(SOCKET_EVENTS.WEBRTC_SEND_ANSWER, handleAnswer);
  }, [on, off]);

  useEffect(() => {
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
        console.warn('Failed to add screen share ICE candidate:', err);
      }
    };

    on(SOCKET_EVENTS.WEBRTC_SEND_ICE_CANDIDATE, handleIceCandidate);
    return () => off(SOCKET_EVENTS.WEBRTC_SEND_ICE_CANDIDATE, handleIceCandidate);
  }, [on, off]);

  useEffect(() => {
    const handleScreenStop = ({ teacherId }) => {
      setRemoteStream(null);
      setIsScreenActive(false);
      setError(null);

      if (teacherId) {
        closePeerConnection(teacherId);
      } else {
        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
        pendingCandidatesRef.current.clear();
      }
    };

    on(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STOPPED, handleScreenStop);
    return () => off(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STOPPED, handleScreenStop);
  }, [closePeerConnection, on, off]);

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionsRef.current.forEach((pc) => pc.close());
  }, []);

  return {
    isSharing,
    remoteStream,
    isScreenActive,
    error,
    startScreenShare,
    stopScreenShare,
    localStream: localStreamRef.current,
    localStreamRef,
  };
};
