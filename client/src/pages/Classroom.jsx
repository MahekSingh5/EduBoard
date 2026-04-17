import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useChat } from '../hooks/useChat';
import { useScreenShare } from '../hooks/useScreenShare';
import { useAudio } from '../hooks/useAudio';
import { useVideo } from '../hooks/useVideo';
import { usePermissions } from '../hooks/usePermissions';
import { SOCKET_EVENTS } from '../utils/socketEvents';
import ChatPanel from '../components/chat/ChatPanel';
import WhiteboardCanvas from '../components/whiteboard/WhiteboardCanvas';
import ScreenShareViewer from '../components/screenshare/ScreenShareViewer';
import ParticipantList from '../components/participants/ParticipantList';
import AudioControls from '../components/audio/AudioControls';
import ResizableCameraWindow from '../components/video/ResizableCameraWindow';
import QuizPanel from '../components/quiz/QuizPanel';

function RemoteAudioStream({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [audioRef, stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

export default function Classroom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { socket, emit, isConnected } = useSocket();
  const chat = useChat(roomCode, token);
  const {
    isSharing,
    remoteStream,
    localStream: localScreenStream,
    isScreenActive,
    error,
    startScreenShare,
    stopScreenShare,
  } = useScreenShare(
    roomCode,
    user?.id,
    user?.role === 'teacher'
  );

  // Audio & Video hooks
  const {
    isMicEnabled,
    hasMicPermission,
    micRequested,
    remoteStreams: audioStreams,
    error: audioError,
    isLoading: audioIsLoading,
    enableMic,
    disableMic,
    requestMicAccess,
    approveMicAccess,
    rejectMicAccess,
  } = useAudio(roomCode, user?._id, user?.role);

  const {
    isCameraEnabled,
    localStream: videoStream,
    remoteStreams: videoStreams,
    error: videoError,
    isLoading: videoIsLoading,
    enableCamera,
    disableCamera,
  } = useVideo(roomCode, user?._id, user?.role);

  const [participants, setParticipants] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const hasLeftRoomRef = useRef(false);
  const userId = user?._id || user?.id;
  const {
    pendingRequests,
    grantDrawingPermission,
    revokeDrawingPermission,
  } = usePermissions(roomCode, userId, user?.role);
  const drawingRequests = Object.entries(pendingRequests)
    .filter(([, request]) => request.drawing)
    .map(([studentId, request]) => ({
      studentId,
      studentName: request.drawing,
    }));
  const remoteVideoStreams = Array.from(videoStreams.entries());
  const remoteAudioStreams = Array.from(audioStreams.entries());
  const getParticipantName = (participantId, fallback) => (
    participants.find((participant) => participant.userId === participantId)?.username || fallback
  );

  // Setup room connection
  useEffect(() => {
    if (!user || !socket || !isConnected) {
      console.log('⏳ Waiting for socket connection...', { user: !!user, socket: !!socket, isConnected });
      return;
    }
    hasLeftRoomRef.current = false;

    console.log(`🚀 Joining room ${roomCode}...`);
    
    // Join room via Socket.IO
    emit(SOCKET_EVENTS.ROOM_JOIN, { roomId: roomCode, username: user.username });
    
    // Listen for room joined confirmation
    const handleRoomJoined = (data) => {
      console.log(`✅ Confirmed joined room:`, data);
      setIsJoined(true);
      if (data.participants) {
        setParticipants(data.participants);
      }
    };

    const handleParticipantJoined = (data) => {
      console.log('👤 Participant joined:', data);
      const participant = data.participant || data;
      setParticipants((prev) => {
        const exists = prev.some((p) => p.socketId === participant.socketId || p.userId === participant.userId);
        return exists ? prev : [...prev, participant];
      });
    };

    const handleParticipantLeft = (data) => {
      console.log('👤 Participant left:', data);
      setParticipants((prev) => prev.filter((p) => (
        p.socketId !== data.socketId && p.userId !== data.userId
      )));
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_USER_JOINED, handleParticipantJoined);
    socket.on(SOCKET_EVENTS.ROOM_USER_LEFT, handleParticipantLeft);

    // Cleanup
    return () => {
      if (!hasLeftRoomRef.current && socket && roomCode) {
        emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId: roomCode, username: user?.username });
        hasLeftRoomRef.current = true;
      }
      socket.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_USER_JOINED, handleParticipantJoined);
      socket.off(SOCKET_EVENTS.ROOM_USER_LEFT, handleParticipantLeft);
    };
  }, [user, socket, roomCode, emit, isConnected, token]);

  const handleScreenShare = async () => {
    if (user?.role !== 'teacher') return;
    if (isSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleLeaveClassroom = () => {
    if (!hasLeftRoomRef.current && roomCode) {
      emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId: roomCode, username: user?.username });
      hasLeftRoomRef.current = true;
    }
    navigate('/lobby');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col">
      {/* Header - Purple theme from moodboard */}
      <div className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 sm:py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-white truncate">🎓 {roomCode}</h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 break-words">
              {user?.username} {isConnected ? '🟢' : '🔴'} {isJoined ? '✅' : '⏳'}
              {isScreenActive && ' 🖥️'}
              {isCameraEnabled && ' 📹'}
              {isMicEnabled && ' 🎤'}
            </p>
          </div>
          <button
            onClick={handleLeaveClassroom}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium shadow-md transition"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!isFullscreen && (
        <div
          className={`flex-1 max-w-7xl w-full mx-auto grid gap-4 p-3 sm:p-4 ${
            showChat ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-1'
          }`}
        >
          {/* Main Content Area - Bigger Whiteboard */}
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            {!isScreenActive && (
              <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-400 to-purple-300 text-white text-center sm:text-left">
                  📊 Whiteboard
                </div>

                {/* Controls */}
                <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap gap-2">
                  {user?.role === 'teacher' && (
                    <button
                      onClick={() => (isCameraEnabled ? disableCamera() : enableCamera())}
                      className={`flex-1 sm:flex-none px-3 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
                        isCameraEnabled
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📹 {isCameraEnabled ? 'Camera On' : 'Camera Off'}
                    </button>
                  )}
                  {user?.role === 'teacher' && (
                    <button
                      onClick={handleScreenShare}
                      className={`flex-1 sm:flex-none px-3 py-2 rounded-lg font-medium text-sm sm:text-base transition ${
                        isSharing
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🖥️ {isSharing ? 'Stop Share' : 'Share'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg font-medium text-sm sm:text-base bg-gradient-to-r from-purple-300 to-purple-200 text-white hover:from-purple-400 hover:to-purple-300 transition shadow-sm"
                    title="Toggle chat"
                  >
                    💬 {showChat ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {/* Video Display - Teacher Camera - Resizable & Draggable */}
            {isCameraEnabled && videoStream && (
              <ResizableCameraWindow
                stream={videoStream}
                userName={user?.username}
                roomId={roomCode}
              />
            )}
            {remoteVideoStreams.map(([participantId, stream]) => (
              <ResizableCameraWindow
                key={participantId}
                stream={stream}
                userName={getParticipantName(participantId, 'Teacher')}
                roomId={roomCode}
              />
            ))}
            {remoteAudioStreams.map(([participantId, stream]) => (
              <RemoteAudioStream key={participantId} stream={stream} />
            ))}

            {/* Whiteboard - Bigger Area */}
            <div className="flex-1 min-h-[55vh] lg:min-h-0 bg-white rounded-xl shadow-lg border border-purple-200 p-2 sm:p-4 relative">
              {user?.role === 'teacher' && drawingRequests.length > 0 && (
                <div className="z-20 mb-3 space-y-2 w-full sm:w-72 sm:absolute sm:right-6 sm:top-6 sm:mb-0">
                  {drawingRequests.map((request) => (
                    <div
                      key={request.studentId}
                      className="rounded-lg border border-purple-200 bg-white p-3 shadow-xl"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {request.studentName} wants to draw
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => grantDrawingPermission(request.studentId, request.studentName)}
                          className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => revokeDrawingPermission(request.studentId)}
                          className="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isScreenActive ? (
                <ScreenShareViewer
                  remoteStream={user?.role === 'teacher' ? localScreenStream : remoteStream}
                  isScreenActive={isScreenActive}
                  error={error}
                  isTeacher={user?.role === 'teacher'}
                  onFullscreen={setIsFullscreen}
                />
              ) : (
                <WhiteboardCanvas roomId={roomCode} />
              )}
            </div>
          </div>

          {/* Right Sidebar - Chat & Controls */}
          {showChat && (
            <div className="space-y-4 overflow-visible lg:overflow-y-auto lg:max-h-[calc(100vh-150px)]">
              {/* Audio Controls - Teachers Only */}
              {user?.role === 'teacher' && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-3 shadow-sm">
                  <p className="text-xs font-semibold text-purple-700 mb-2">🎤 Microphone</p>
                  <AudioControls
                    isMicEnabled={isMicEnabled}
                    hasMicPermission={hasMicPermission}
                    micRequested={micRequested}
                    isLoading={audioIsLoading}
                    error={audioError}
                    onEnableMic={enableMic}
                    onDisableMic={disableMic}
                    onRequestMic={requestMicAccess}
                  />
                </div>
              )}

              {user?.role === 'teacher' && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-3 shadow-sm">
                  <p className="text-xs font-semibold text-purple-700 mb-2">📹 Camera</p>
                  <button
                    onClick={() => (isCameraEnabled ? disableCamera() : enableCamera())}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition text-sm ${
                      isCameraEnabled
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    📹 {isCameraEnabled ? 'Camera On' : 'Turn On Camera'}
                  </button>
                  {videoError && <p className="text-xs text-red-600 mt-2">{videoError}</p>}
                </div>
              )}

              {/* Connection Status */}
              {!isJoined && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  ⏳ Connecting...
                </div>
              )}

              {/* Quiz/Poll Panel */}
              <QuizPanel
                roomId={roomCode}
                userId={user?._id}
                userRole={user?.role}
              />

              {/* Chat */}
              <ChatPanel
                messages={chat.messages}
                sendMessage={chat.sendMessage}
                addReaction={chat.addReaction}
                typingUsers={chat.typingUsers}
              />

              {/* Participants */}
              <ParticipantList participants={participants} />
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Screen Share */}
      {isFullscreen && (
        <div className="flex-1 bg-black">
          <ScreenShareViewer
            remoteStream={user?.role === 'teacher' ? localScreenStream : remoteStream}
            isScreenActive={isScreenActive}
            error={error}
            isTeacher={user?.role === 'teacher'}
            onFullscreen={setIsFullscreen}
          />
        </div>
      )}
    </div>
  );
}
