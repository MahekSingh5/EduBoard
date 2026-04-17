# 🚀 EduBoard - Developer Quick Reference

## New Files Quick Links

### Services (6 files)
```javascript
// Use any of these for API calls
import { authService } from './services/authService';
import { roomService } from './services/roomService';
import { chatService } from './services/chatService';
import { quizService } from './services/quizService';
import { boardService } from './services/boardService';
import apiClient from './services/apiClient'; // Base client
```

### Hooks
```javascript
import { useAudio } from './hooks/useAudio';
// Usage: const { isMicEnabled, enableMic, ... } = useAudio(roomId, userId, role);
```

### Audio Components
```javascript
import AudioControls from './components/audio/AudioControls';
import AudioOutput from './components/audio/AudioOutput';
import MicPermissionPanel from './components/audio/MicPermissionPanel';
import ParticipantAudioStatus from './components/audio/ParticipantAudioStatus';
```

### Layout Components
```javascript
import ClassroomHeader from './components/layout/ClassroomHeader';
import ClassroomSidebar from './components/layout/ClassroomSidebar';
import ClassroomLayout from './components/layout/ClassroomLayout';
```

### Quiz & Reactions
```javascript
import QuizPanel from './components/quiz/QuizPanel';
import ReactionPanel from './components/reactions/ReactionPanel';
```

### Error Handling
```javascript
import ErrorBoundary from './components/common/ErrorBoundary';
```

### Utilities
```javascript
import { validateRegistration, validateLogin, ... } from './utils/validation';
import audioManager from './utils/audioManager';
```

---

## Common Code Patterns

### 1. Using API Services
```javascript
// Login
const response = await authService.login(email, password);
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// Create room
const room = await roomService.createRoom('Room Name', 'Description');

// Send message
const message = await chatService.sendMessage(roomId, 'Hello!');
```

### 2. Using Audio Hook
```javascript
const {
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
} = useAudio(roomCode, user._id, user.role);

// Enable microphone
await enableMic();

// Request permission (students only)
requestMicAccess();

// Approve student (teachers only)
approveMicAccess(studentId);
```

### 3. Using Validation
```javascript
import { validateRegistration } from './utils/validation';

const { isValid, errors } = validateRegistration({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  role: 'student'
});

if (!isValid) {
  console.log(errors); // { username: '', email: '', ... }
}
```

### 4. Rendering Audio Components
```javascript
<AudioControls
  isMicEnabled={isMicEnabled}
  hasMicPermission={hasMicPermission}
  micRequested={micRequested}
  isLoading={isLoading}
  error={error}
  onEnableMic={enableMic}
  onDisableMic={disableMic}
  onRequestMic={requestMicAccess}
/>

<MicPermissionPanel
  roomId={roomCode}
  students={studentList}
/>

<ParticipantAudioStatus
  participants={participants}
  speakingParticipants={speakingSet}
/>

{/* Render remote audio streams */}
{Array.from(remoteStreams.values()).map((stream, idx) => (
  <AudioOutput key={idx} stream={stream} />
))}
```

### 5. Error Boundary Setup
```javascript
// In App.jsx or main.jsx
import ErrorBoundary from './components/common/ErrorBoundary';

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

---

## Socket Events (Audio)

### Emit Events
```javascript
socket.emit('audio:micRequest', { roomId, userId, username });
socket.emit('audio:micApproved', { roomId, studentId });
socket.emit('audio:micRejected', { roomId, studentId });
socket.emit('audio:micEnabled', { roomId, userId, username });
socket.emit('audio:micDisabled', { roomId, userId });
socket.emit('audio:offer', { roomId, from, to, offer });
socket.emit('audio:answer', { roomId, from, to, answer });
socket.emit('audio:iceCandidate', { roomId, from, to, candidate });
```

### Listen Events
```javascript
socket.on('audio:micRequest', (data) => {
  // New student mic request
  console.log(data.studentId, data.username);
});

socket.on('audio:micApproved', () => {
  // Permission granted
});

socket.on('audio:micEnabled', (data) => {
  // User started speaking
  console.log(data.userId, 'is speaking');
});

socket.on('audio:micDisabled', (data) => {
  // User stopped speaking
  console.log(data.userId, 'stopped');
});
```

---

## Configuration Files to Update

### SocketContext.jsx
```javascript
const socket = io(SOCKET_URL, {
  auth: {
    token,
    userId,      // ← ADD THIS
    username,    // ← ADD THIS
    role,        // ← ADD THIS
  },
});
```

### .env (if needed)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Deployment Checklist

- [ ] Update SocketContext with auth data (userId, username, role)
- [ ] Integrate AudioControls in Classroom.jsx
- [ ] Add MicPermissionPanel for teachers
- [ ] Add ParticipantAudioStatus for status display
- [ ] Add AudioOutput elements for remote streams
- [ ] Wrap app with ErrorBoundary
- [ ] Replace axios calls with service methods
- [ ] Update form validation using validation utilities
- [ ] Test all features:
  - [ ] Microphone on/off
  - [ ] Mic request/approval
  - [ ] Audio transmission
  - [ ] Quiz creation
  - [ ] Emoji reactions
  - [ ] Sidebar navigation
  - [ ] Error handling

---

## Debugging Commands

### Check Socket Connection
```javascript
// In browser console
socket
socket.id
socket.connected
socket.auth
```

### Check Microphone
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone accessible');
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.log('Microphone error:', err));
```

### Check WebRTC Connections
```
// In browser:
// 1. Press F12 (DevTools)
// 2. Go to chrome://webrtc-internals/
// 3. Monitor peer connections
```

### Check Network (Socket.IO)
```javascript
// DevTools → Network → Filter by 'socket.io'
// Look for successful handshake and event messages
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Microphone access denied | User rejected permission | Click allow in browser permission dialog |
| WebRTC offer not received | Socket not connected | Check socket connection status |
| Audio not transmitting | Peer connection failed | Check WebRTC stats, verify ICE candidates |
| Student can't request mic | Socket not in room | Ensure join room event fired |
| Teacher doesn't see request | Room filtering issue | Check room ID in socket emit |
| Form validation fails | Wrong format | Check error message for specific issue |

---

## Performance Tips

1. **For 20+ participants:**
   - Monitor WebRTC stats
   - Consider server-side audio mixing
   - Use hardware acceleration

2. **For mobile:**
   - Use aggressive noise suppression
   - Lower video quality
   - Optimize component rendering

3. **Memory:**
   - Close unused peer connections
   - Cleanup socket listeners
   - Remove old audio streams

---

## Testing Code

### Test Audio Hook
```javascript
// In a test component
function TestAudio() {
  const audio = useAudio('test-room', 'user-123', 'student');
  
  return (
    <div>
      <button onClick={audio.enableMic}>Enable</button>
      <button onClick={audio.disableMic}>Disable</button>
      <button onClick={audio.requestMicAccess}>Request</button>
      <p>{audio.isMicEnabled ? 'Enabled' : 'Disabled'}</p>
      {audio.error && <p className="error">{audio.error}</p>}
    </div>
  );
}
```

### Test Validation
```javascript
import { validateRegistration } from './utils/validation';

const result = validateRegistration({
  username: 'john',
  email: 'john@test.com',
  password: '123456',
  confirmPassword: '123456',
  role: 'student'
});

console.log(result.isValid); // true
console.log(result.errors); // {}
```

---

## File Organization Best Practices

### Keep components focused
```javascript
// ❌ Bad: Component doing too much
function Classroom() {
  // 500 lines of code
}

// ✅ Good: Break into smaller components
<Classroom>
  <ClassroomHeader />
  <ClassroomContent>
    <AudioSection />
    <ChatSection />
    <ParticipantSection />
  </ClassroomContent>
</Classroom>
```

### Reuse components
```javascript
// ❌ Bad: Button duplicated 5 times
<button onClick={...}>Start</button>
<button onClick={...}>Stop</button>

// ✅ Good: Use Button component
<Button onClick={...}>Start</Button>
<Button onClick={...}>Stop</Button>
```

### Keep hooks simple
```javascript
// ✅ Good: useAudio only handles audio
const { isMicEnabled, enableMic, ... } = useAudio(...);

// Use other hooks for other concerns
const { messages } = useChat(...);
const { participants } = useRoom(...);
```

---

## Resources

- **FEATURES.md** - Complete documentation
- **INTEGRATION.md** - Step-by-step integration
- **PROJECT_COMPLETION.md** - Project overview

---

**Happy coding! 🚀**
