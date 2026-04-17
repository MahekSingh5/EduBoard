import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export const usePermissions = (roomId, userId, userRole) => {
  const { emit, on, off } = useSocket();
  const [drawingPermissions, setDrawingPermissions] = useState({});
  const [screenSharePermissions, setScreenSharePermissions] = useState({});
  const [pendingRequests, setPendingRequests] = useState({});
  const [drawingRequestStatus, setDrawingRequestStatus] = useState('idle');

  // Teacher only: grant drawing permission
  const grantDrawingPermission = useCallback(
    (studentId, studentName) => {
      if (userRole !== 'teacher') return;
      
      emit('permissions:grant-drawing', {
        roomId,
        studentId,
        studentName,
      });
      
      setDrawingPermissions((prev) => ({
        ...prev,
        [studentId]: true,
      }));
      setPendingRequests((prev) => {
        const next = { ...prev };
        if (next[studentId]) {
          next[studentId] = { ...next[studentId] };
          delete next[studentId].drawing;
          if (!next[studentId].screenShare) delete next[studentId];
        }
        return next;
      });
    },
    [emit, roomId, userRole]
  );

  // Teacher only: revoke drawing permission
  const revokeDrawingPermission = useCallback(
    (studentId) => {
      if (userRole !== 'teacher') return;
      
      emit('permissions:revoke-drawing', {
        roomId,
        studentId,
      });
      
      setDrawingPermissions((prev) => ({
        ...prev,
        [studentId]: false,
      }));
      setPendingRequests((prev) => {
        const next = { ...prev };
        if (next[studentId]) {
          next[studentId] = { ...next[studentId] };
          delete next[studentId].drawing;
          if (!next[studentId].screenShare) delete next[studentId];
        }
        return next;
      });
    },
    [emit, roomId, userRole]
  );

  // Teacher only: grant screen share permission
  const grantScreenSharePermission = useCallback(
    (studentId, studentName) => {
      if (userRole !== 'teacher') return;
      
      emit('permissions:grant-screen-share', {
        roomId,
        studentId,
        studentName,
      });
      
      setScreenSharePermissions((prev) => ({
        ...prev,
        [studentId]: true,
      }));
    },
    [emit, roomId, userRole]
  );

  // Teacher only: revoke screen share permission
  const revokeScreenSharePermission = useCallback(
    (studentId) => {
      if (userRole !== 'teacher') return;
      
      emit('permissions:revoke-screen-share', {
        roomId,
        studentId,
      });
      
      setScreenSharePermissions((prev) => ({
        ...prev,
        [studentId]: false,
      }));
    },
    [emit, roomId, userRole]
  );

  // Student: request drawing permission
  const requestDrawingPermission = useCallback(() => {
    if (userRole !== 'student') return;
    
    emit('permissions:request-drawing', {
      roomId,
      studentId: userId,
    });
    setDrawingRequestStatus('pending');
  }, [emit, roomId, userId, userRole]);

  // Student: request screen share permission
  const requestScreenSharePermission = useCallback(() => {
    if (userRole !== 'student') return;
    
    emit('permissions:request-screen-share', {
      roomId,
      studentId: userId,
    });
  }, [emit, roomId, userId, userRole]);

  // Check if user has drawing permission
  const canDraw = useCallback(() => {
    if (userRole === 'teacher') return true;
    return drawingPermissions[userId] === true;
  }, [userRole, userId, drawingPermissions]);

  // Check if user has screen share permission
  const canScreenShare = useCallback(() => {
    if (userRole === 'teacher') return true;
    return screenSharePermissions[userId] === true;
  }, [userRole, userId, screenSharePermissions]);

  // Socket listeners
  useEffect(() => {
    const handleDrawingGranted = ({ studentId }) => {
      if (studentId === userId) {
        setDrawingPermissions((prev) => ({ ...prev, [userId]: true }));
        setDrawingRequestStatus('granted');
      }
      if (userRole === 'teacher') {
        setDrawingPermissions((prev) => ({ ...prev, [studentId]: true }));
        setPendingRequests((prev) => {
          const next = { ...prev };
          if (next[studentId]) {
            next[studentId] = { ...next[studentId] };
            delete next[studentId].drawing;
            if (!next[studentId].screenShare) delete next[studentId];
          }
          return next;
        });
      }
    };

    const handleDrawingRevoked = ({ studentId }) => {
      if (studentId === userId) {
        setDrawingPermissions((prev) => ({ ...prev, [userId]: false }));
        setDrawingRequestStatus('rejected');
      }
      if (userRole === 'teacher') {
        setDrawingPermissions((prev) => ({ ...prev, [studentId]: false }));
        setPendingRequests((prev) => {
          const next = { ...prev };
          if (next[studentId]) {
            next[studentId] = { ...next[studentId] };
            delete next[studentId].drawing;
            if (!next[studentId].screenShare) delete next[studentId];
          }
          return next;
        });
      }
    };

    const handleScreenShareGranted = ({ studentId }) => {
      if (studentId === userId) {
        setScreenSharePermissions((prev) => ({ ...prev, [userId]: true }));
      }
    };

    const handleScreenShareRevoked = ({ studentId }) => {
      if (studentId === userId) {
        setScreenSharePermissions((prev) => ({ ...prev, [userId]: false }));
      }
    };

    const handleDrawingRequest = ({ studentId, studentName }) => {
      if (userRole === 'teacher') {
        setPendingRequests((prev) => ({
          ...prev,
          [studentId]: { ...prev[studentId], drawing: studentName || 'Student' },
        }));
      }
    };

    const handleScreenShareRequest = ({ studentId, studentName }) => {
      if (userRole === 'teacher') {
        setPendingRequests((prev) => ({
          ...prev,
          [studentId]: { ...prev[studentId], screenShare: studentName },
        }));
      }
    };

    // Receive permission grant notifications
    on('permissions:drawing-granted', handleDrawingGranted);
    on('permissions:drawing-revoked', handleDrawingRevoked);
    on('permissions:screen-share-granted', handleScreenShareGranted);
    on('permissions:screen-share-revoked', handleScreenShareRevoked);

    // Teacher receives permission requests
    on('permissions:request-drawing', handleDrawingRequest);
    on('permissions:request-screen-share', handleScreenShareRequest);

    return () => {
      off('permissions:drawing-granted', handleDrawingGranted);
      off('permissions:drawing-revoked', handleDrawingRevoked);
      off('permissions:screen-share-granted', handleScreenShareGranted);
      off('permissions:screen-share-revoked', handleScreenShareRevoked);
      off('permissions:request-drawing', handleDrawingRequest);
      off('permissions:request-screen-share', handleScreenShareRequest);
    };
  }, [on, off, userId, userRole]);

  return {
    drawingPermissions,
    screenSharePermissions,
    pendingRequests,
    drawingRequestStatus,
    grantDrawingPermission,
    revokeDrawingPermission,
    grantScreenSharePermission,
    revokeScreenSharePermission,
    requestDrawingPermission,
    requestScreenSharePermission,
    canDraw,
    canScreenShare,
  };
};
