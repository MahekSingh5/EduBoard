import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export const useWebRTC = (roomId, userId, isTeacher) => {
  const { emit, on, off } = useSocket();
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [peers, setPeers] = useState({});
  const pcRef = useRef(new Map());

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      emit(SOCKET_EVENTS.WEBRTC_REQUEST_SCREEN_SHARE, { roomId });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }, [emit, roomId]);

  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      emit(SOCKET_EVENTS.WEBRTC_STOP_SCREEN_SHARE, { roomId });
    }
  }, [screenStream, emit, roomId]);

  // Socket listeners
  useEffect(() => {
    on(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STARTED, ({ teacherId, teacherName }) => {
      console.log(`${teacherName} started screen sharing`);
      // Handle incoming screen share
    });

    on(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STOPPED, () => {
      setIsScreenSharing(false);
      setScreenStream(null);
    });

    return () => {
      off(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STARTED);
      off(SOCKET_EVENTS.WEBRTC_SCREEN_SHARE_STOPPED);
    };
  }, [on, off]);

  return {
    isScreenSharing,
    screenStream,
    peers,
    startScreenShare,
    stopScreenShare,
  };
};
