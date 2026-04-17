# EduBoard - Implementation & Integration Guide

## Quick Integration Checklist

This guide helps you integrate the new features into your existing Classroom.jsx and other components.

### Step 1: Update Classroom.jsx with New Hooks

```javascript
import { useAudio } from '../hooks/useAudio';
import AudioControls from '../components/audio/AudioControls';
import ParticipantAudioStatus from '../components/audio/ParticipantAudioStatus';
import ClassroomHeader from '../components/layout/ClassroomHeader';
import ClassroomSidebar from '../components/layout/ClassroomSidebar';

export default function Classroom() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  // Audio management
  const {
    isMicEnabled,
    hasMicPermission,
    micRequested,
    remoteStreams,
    error: audioError,
    isLoading: audioIsLoading,
    enableMic,
    disableMic,
    requestMicAccess,
    approveMicAccess,
    rejectMicAccess,
  } = useAudio(roomCode, user?._id, user?.role);

  const [activeTab, setActiveTab] = useState('board');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <ClassroomHeader 
        roomCode={roomCode}
        roomName="Classroom Name"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ClassroomSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasRaisedHand={false}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {activeTab === 'board' && (
            <div className="flex-1 flex gap-4 p-4">
              {/* Whiteboard */}
              <div className="flex-1 bg-white rounded-lg shadow">
                <WhiteboardCanvas roomId={roomCode} />
              </div>

              {/* Right Panel - Audio & Participants */}
              <div className="w-80 space-y-4 overflow-y-auto">
                {/* Audio Controls */}
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

                {/* Participants */}
                <ParticipantList participants={participants} />

                {/* Participant Audio Status */}
                <ParticipantAudioStatus
                  participants={participants}
                  speakingParticipants={speakingParticipants}
                />
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <ChatPanel roomId={roomCode} />
          )}

          {activeTab === 'quiz' && (
            <QuizPanel roomId={roomCode} isTeacher={user?.role === 'teacher'} />
          )}

          {activeTab === 'participants' && (
            <>
              {user?.role === 'teacher' && (
                <MicPermissionPanel roomId={roomCode} students={students} />
              )}
              <ParticipantList participants={participants} />
            </>
          )}
        </main>
      </div>

      {/* Render remote audio streams */}
      {Array.from(remoteStreams.values()).map((stream, idx) => (
        <AudioOutput key={idx} stream={stream} />
      ))}
    </div>
  );
}
```

### Step 2: Wrap App with ErrorBoundary

In your `src/main.jsx` or `src/App.jsx`:

```javascript
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <RoomProvider>
            <AppContent />
          </RoomProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### Step 3: Update SocketContext

Ensure your SocketContext passes userId, username, and role for audio to work:

```javascript
<SocketProvider 
  token={token} 
  userId={user._id}           // Required for audio
  username={user.username}    // Required for audio
  role={user.role}            // Required for audio
>
  {children}
</SocketProvider>
```

### Step 4: Update Socket Setup in SocketContext

When initializing the socket, include auth data:

```javascript
const socket = io(SOCKET_URL, {
  auth: {
    token,
    userId,      // NEW
    username,    // NEW
    role,        // NEW
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

---

## Feature Integration Points

### 1. Form Validation Integration

For registration form:
```javascript
import { validateRegistration } from '../utils/validation';

const handleSubmit = (formData) => {
  const { isValid, errors } = validateRegistration(formData);
  
  if (!isValid) {
    setFormErrors(errors);
    return;
  }

  await authService.register(
    formData.username,
    formData.email,
    formData.password,
    formData.role
  );
};
```

### 2. API Service Integration

Instead of using axios directly:

```javascript
// Before
const response = await axios.post('/api/auth/login', { email, password });

// After
import { authService } from '../services/authService';
const response = await authService.login(email, password);
```

### 3. Teacher Mic Permission Workflow

```javascript
// Listen for mic requests and update UI
useEffect(() => {
  if (user?.role !== 'teacher') return;

  socket?.on('audio:micRequest', (data) => {
    // Update UI to show pending request
    setPendingMicRequests((prev) => [...prev, data.studentId]);
  });

  return () => socket?.off('audio:micRequest');
}, [socket, user?.role]);

// Handle approval
const handleApproveMic = (studentId) => {
  approveMicAccess(studentId);
  setPendingMicRequests((prev) => prev.filter((id) => id !== studentId));
};
```

### 4. Monitor Speaking Participants

```javascript
useEffect(() => {
  const speakingSet = new Set();

  socket?.on('audio:micEnabled', (data) => {
    speakingSet.add(data.userId);
    setSpeakingParticipants(new Set(speakingSet));
  });

  socket?.on('audio:micDisabled', (data) => {
    speakingSet.delete(data.userId);
    setSpeakingParticipants(new Set(speakingSet));
  });

  return () => {
    socket?.off('audio:micEnabled');
    socket?.off('audio:micDisabled');
  };
}, [socket]);
```

---

## Files to Update/Create Summary

### Frontend Files to Create/Update
✅ Created:
- `client/src/services/apiClient.js`
- `client/src/services/authService.js`
- `client/src/services/roomService.js`
- `client/src/services/chatService.js`
- `client/src/services/quizService.js`
- `client/src/services/boardService.js`
- `client/src/hooks/useAudio.js`
- `client/src/utils/audioManager.js`
- `client/src/utils/validation.js`
- `client/src/components/layout/ClassroomHeader.jsx`
- `client/src/components/layout/ClassroomSidebar.jsx`
- `client/src/components/layout/ClassroomLayout.jsx`
- `client/src/components/audio/AudioControls.jsx`
- `client/src/components/audio/AudioOutput.jsx`
- `client/src/components/audio/MicPermissionPanel.jsx`
- `client/src/components/audio/ParticipantAudioStatus.jsx`
- `client/src/components/quiz/QuizPanel.jsx`
- `client/src/components/reactions/ReactionPanel.jsx`
- `client/src/components/common/ErrorBoundary.jsx`

💾 Should Update:
- `client/src/pages/Classroom.jsx` - Integrate new components
- `client/src/context/SocketContext.jsx` - Add userId, username, role

### Backend Files to Update/Create
✅ Created:
- `server/src/sockets/audio.socket.js`

💾 Should Update:
- `server/src/sockets/index.js` ✅ Done

---

## Testing Checklist

- [ ] Audio controls appear in classroom
- [ ] Teacher can enable/disable microphone
- [ ] Student can request microphone
- [ ] Teacher can approve/reject student request
- [ ] Approved student can enable microphone
- [ ] Rejected student sees error message
- [ ] ParticipantAudioStatus shows speaking indicators
- [ ] Remote audio streams play (audio tag with srcObject)
- [ ] WebRTC peer connections established (check DevTools)
- [ ] Quiz panel appears and can create quizzes
- [ ] Emoji reactions functional
- [ ] Sidebar navigation works
- [ ] Error boundary catches component errors
- [ ] API services handle errors properly
- [ ] Form validation works on all forms

---

## Browser Compatibility

- ✅ Chrome/Edge 70+
- ✅ Firefox 65+
- ✅ Safari 14+
- ✅ Opera 57+

**Requirements:**
- HTTPS (or localhost for development)
- Microphone permissions
- WebRTC support

---

## Performance Optimization Notes

1. **Audio streams:** Each remote user = 1 peer connection
   - For 30+ users, consider server-side audio mixing

2. **Component rendering:** useAudio hook is optimized
   - useCallback for all callbacks
   - useRef for non-rendering state

3. **Socket events:** Filtered by room ID
   - Prevents cross-room interference

4. **Memory cleanup:** useEffect cleanups in place
   - Streams properly closed on unmount

---

## Debugging Tips

### Check Socket Connection
```javascript
const { socket, isConnected } = useSocket();
console.log('Connected:', isConnected);
console.log('Socket ID:', socket?.id);
```

### Check Microphone Permission
```javascript
const { error, isMicEnabled } = useAudio(roomId, userId, role);
if (error) console.log('Audio error:', error);
```

### Check WebRTC Stats
```javascript
// In browser DevTools:
// 1. Open Developer Tools
// 2. chrome://webrtc-internals/
// 3. Monitor peer connections and statistics
```

### Check Socket Events
```javascript
socket?.onAny((event, ...args) => {
  console.log(`Socket event: ${event}`, args);
});
```

---

## Support & Troubleshooting

See [FEATURES.md](./FEATURES.md) for detailed component documentation and [Troubleshooting section](./FEATURES.md#troubleshooting).
