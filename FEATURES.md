# EduBoard - Complete Feature Documentation

## Table of Contents
1. [Audio/Microphone System](#audiovmicrophone-system)
2. [API Services Layer](#api-services-layer)
3. [UI Components](#ui-components)
4. [Validation System](#validation-system)
5. [Error Handling](#error-handling)
6. [Socket Events](#socket-events)

---

## Audio/Microphone System

### Overview
The audio system allows **teachers to always speak** and **students to request microphone access** from teachers. All audio is transmitted via WebRTC peer-to-peer connections for security and quality.

### How It Works

#### For Teachers
1. Go to the Classroom
2. Click "🟢 Start Microphone" in the Audio Controls
3. Your voice is now broadcast to all students in the class
4. You can "Approve" or "Reject" microphone requests from students
5. Click "🟴 Stop Microphone" to disable

#### For Students
1. Go to the Classroom
2. If you want to speak, click "🙋 Request Microphone"
3. Wait for teacher approval
4. Once approved, click "🟢 Start Microphone"
5. Your voice is now audible to everyone
6. Click "🟴 Stop Microphone" when done

### Technical Architecture

#### Frontend (Client-side)

**Key Files:**
- `src/hooks/useAudio.js` - Main audio hook
- `src/utils/audioManager.js` - WebRTC utilities
- `src/components/audio/AudioControls.jsx` - Mic toggle UI
- `src/components/audio/MicPermissionPanel.jsx` - Teacher approval panel
- `src/components/audio/ParticipantAudioStatus.jsx` - Who's speaking display
- `src/components/audio/AudioOutput.jsx` - Audio playback component

**Flow:**

```
useAudio Hook
├── Manages microphone state
├── Handles permission requests
├── Creates WebRTC peer connections
├── Emits/listens to socket events
└── Returns state & control methods
```

**useAudio Hook Methods:**

```javascript
const {
  isMicEnabled,           // Boolean: is mic active
  hasMicPermission,       // Boolean: has teacher approved
  micRequested,           // Boolean: waiting for approval
  remoteStreams,          // Map of user streams
  error,                  // Error message if any
  isLoading,              // Loading state
  enableMic,              // Start broadcasting
  disableMic,             // Stop broadcasting
  requestMicAccess,       // Request from teacher (students only)
  approveMicAccess,       // Approve student (teachers only)
  rejectMicAccess,        // Reject student (teachers only)
} = useAudio(roomId, userId, userRole);
```

#### Backend (Server-side)

**File:** `src/sockets/audio.socket.js`

**Socket Events Handled:**

| Event | Sender | Receiver | Purpose |
|-------|--------|----------|---------|
| `audio:micRequest` | Student | Teacher | Request to speak |
| `audio:micApproved` | Teacher | Student | Approve permission |
| `audio:micRejected` | Teacher | Student | Deny permission |
| `audio:micEnabled` | User(s) | Room | User started broadcasting |
| `audio:micDisabled` | User(s) | Room | User stopped broadcasting |
| `audio:offer` | User A | User B | WebRTC offer |
| `audio:answer` | User B | User A | WebRTC answer |
| `audio:iceCandidate` | User | User | Connection negotiation |

### WebRTC Peer Connection Setup

1. **When a user enables their mic:**
   - Request system microphone access
   - Broadcast `audio:micEnabled` to room

2. **When other users receive `audio:micEnabled`:**
   - Create new RTCPeerConnection for that user
   - Add local stream to peer
   - Create offer and send via socket

3. **When user receives offer:**
   - Create peer connection
   - Set remote description
   - Create answer and send back

4. **ICE Candidates:**
   - Exchange network candidates for connection
   - Allows NAT traversal

### Audio Quality Features

- **Echo Cancellation** - Prevents echo feedback
- **Noise Suppression** - Removes background noise
- **Auto Gain Control** - Normalizes volume levels
- **Encryption** - All audio is peer-to-peer encrypted

### Error Handling

```javascript
try {
  await enableMic();
} catch (error) {
  if (error.message.includes('Microphone')) {
    // Microphone not available or denied
    setError('Please enable microphone in browser settings');
  }
}
```

---

## API Services Layer

### Purpose
Centralized HTTP request management with automatic token handling and error management.

### File Structure
```
src/services/
├── apiClient.js      # Base axios instance with interceptors
├── authService.js    # Authentication endpoints
├── roomService.js    # Room management endpoints
├── chatService.js    # Chat endpoints
├── quizService.js    # Quiz endpoints
└── boardService.js   # Whiteboard endpoints
```

### API Client Setup

**File:** `src/services/apiClient.js`

Features:
- Automatic JWT token injection
- Request/response interceptors
- Error handling with automatic logout on 401
- 10-second timeout

```javascript
import apiClient from './services/apiClient';

// Use apiClient for all API calls
const response = await apiClient.get('/api/auth/me');
```

### Service Examples

#### Auth Service
```javascript
import { authService } from './services/authService';

// Register
const user = await authService.register(
  'john_doe',
  'john@example.com',
  'password123',
  'student'
);

// Login
const response = await authService.login('john@example.com', 'password123');

// Get current user
const user = await authService.getMe();
```

#### Room Service
```javascript
import { roomService } from './services/roomService';

// Create room
const room = await roomService.createRoom('Math Class', 'Basic Algebra');

// Get user's rooms
const rooms = await roomService.getTeacherRooms();

// Join room
const room = await roomService.joinRoom('ABC123');
```

#### Chat Service
```javascript
import { chatService } from './services/chatService';

// Send message
const message = await chatService.sendMessage(roomId, 'Hello everyone!');

// Edit message
const updated = await chatService.editMessage(roomId, messageId, 'Hello all!');

// Delete message
await chatService.deleteMessage(roomId, messageId);
```

#### Quiz Service
```javascript
import { quizService } from './services/quizService';

// Create quiz
const quiz = await quizService.createQuiz(roomId, 'Chapter 1 Quiz', [
  {
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
  }
]);

// Submit answers
const results = await quizService.submitAnswers(roomId, quizId, answers);
```

---

## UI Components

### New Components Created

#### Layout Components

**ClassroomHeader.jsx**
- Displays room name and code
- Shows user role badge
- Menu for user settings

**ClassroomSidebar.jsx**
- Navigation tabs for all features
- Notification indicators
- Info section for user role

**ClassroomLayout.jsx**
- Main layout wrapper
- Responsive desktop/mobile layout
- Loading state management

#### Audio Components

**AudioControls.jsx**
- Microphone toggle button
- Permission status display
- Error messages
- Different views for teacher/student

**MicPermissionPanel.jsx**
- Shows pending mic requests
- Approve/Reject buttons
- Request counter badge

**ParticipantAudioStatus.jsx**
- Lists all participants
- Shows who's speaking (animated red indicator)
- Displays mic permission status
- Color-coded status indicators

**AudioOutput.jsx**
- Audio element for receiving streams
- Automatically plays remote audio

#### Quiz Components

**QuizPanel.jsx**
- Create new quizzes (teacher only)
- Display existing quizzes
- Start/Edit/Delete quizzes
- Add questions with multiple-choice answers
- Mark correct answer

#### Reactions Components

**ReactionPanel.jsx**
- Send emoji reactions (👍, ❤️, 😄, 😮, 😢, 🔥, 👏, 🎉)
- Display recent reactions
- Real-time reaction feedback

#### Error Handling

**ErrorBoundary.jsx**
- Catches React component errors
- Displays user-friendly error page
- Refresh button to reload
- Development error details

### Component Integration Example

```javascript
import ClassroomHeader from './components/layout/ClassroomHeader';
import ClassroomSidebar from './components/layout/ClassroomSidebar';
import AudioControls from './components/audio/AudioControls';
import { useAudio } from './hooks/useAudio';

function ClassroomPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { isMicEnabled, ...audioControls } = useAudio(roomCode, user.id, user.role);

  return (
    <div>
      <ClassroomHeader roomCode={roomCode} />
      <ClassroomSidebar activeTab={activeTab} />
      <AudioControls isMicEnabled={isMicEnabled} {...audioControls} />
    </div>
  );
}
```

---

## Validation System

**File:** `src/utils/validation.js`

### Validation Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `isValidEmail(email)` | Email format check | Boolean |
| `isValidPassword(password)` | Min 6 characters | Boolean |
| `isValidUsername(username)` | 3-20 chars, alphanumeric | Boolean |
| `isValidRoomCode(code)` | Min 4 characters | Boolean |
| `validateRegistration(data)` | Full registration form | `{isValid, errors}` |
| `validateLogin(data)` | Login form | `{isValid, errors}` |
| `validateRoomCreation(data)` | Room creation | `{isValid, errors}` |
| `validateQuiz(data)` | Quiz form | `{isValid, errors}` |

### Usage Example

```javascript
import { validateRegistration, validateLogin } from './utils/validation';

const handleRegister = (formData) => {
  const { isValid, errors } = validateRegistration(formData);
  
  if (!isValid) {
    // Display errors
    console.log(errors.email); // "Invalid email address"
    return;
  }
  
  // Proceed with registration
};
```

### Error Messages

**Registration errors:**
- Username must be 3-20 characters
- Invalid email address
- Password must be at least 6 characters
- Passwords do not match
- Please select a role

**Room creation errors:**
- Room name is required
- Room name cannot exceed 100 characters
- Description cannot exceed 500 characters

---

## Error Handling

### Global Error Boundary

Wrap your app with ErrorBoundary:

```javascript
import ErrorBoundary from './components/common/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### API Error Handling

ApiClient automatically:
- Logs out user on 401 (Unauthorized)
- Catches network errors
- Provides error messages

### Audio Error Handling

```javascript
const { error, enableMic } = useAudio(roomId, userId, role);

useEffect(() => {
  if (error) {
    console.error('Audio error:', error);
    // Show error to user
  }
}, [error]);
```

---

## Socket Events

### Audio Socket Events

**New events added to `src/utils/socketEvents.js`:**

```javascript
SOCKET_EVENTS = {
  // ... existing events ...
  AUDIO_MIC_REQUEST: 'audio:micRequest',
  AUDIO_MIC_APPROVED: 'audio:micApproved',
  AUDIO_MIC_REJECTED: 'audio:micRejected',
  AUDIO_MIC_ENABLED: 'audio:micEnabled',
  AUDIO_MIC_DISABLED: 'audio:micDisabled',
  AUDIO_OFFER: 'audio:offer',
  AUDIO_ANSWER: 'audio:answer',
  AUDIO_ICE_CANDIDATE: 'audio:iceCandidate',
}
```

### Backend Socket Implementation

**File:** `src/sockets/audio.socket.js`

Handles:
- Permission requests from students
- Teacher approval/rejection
- Peer connection establishment
- WebRTC offer/answer/ICE negotiation

---

## Testing the Microphone Feature

### Manual Testing Steps

1. **Test with Teacher:**
   - Login as teacher
   - Create/join classroom
   - Click "🟢 Start Microphone"
   - Verify console shows "Microphone enabled"
   - Click "🟴 Stop Microphone"

2. **Test with Student:**
   - Login as student in different window
   - Join same classroom
   - Click "🙋 Request Microphone"
   - Teacher approves in MicPermissionPanel
   - Student sees "🟢 Start Microphone" button
   - Click to start
   - Verify both can hear each other

3. **Test Permission Rejection:**
   - Student requests mic
   - Teacher clicks "Reject"
   - Student sees "Your microphone request was rejected"

4. **Verify ParticipantAudioStatus:**
   - See speaking user with red pulsing indicator
   - Non-speaking users show gray dot
   - Participant list shows who has mic permission

---

## Troubleshooting

### Microphone Not Working

1. **Check browser permissions:**
   - Allow HTTPS or localhost
   - Allow microphone/audio permissions

2. **Check console for errors:**
   - Look for "Error accessing microphone"
   - Check network tab for socket connections

3. **Verify socket connection:**
   ```javascript
   const { socket, isConnected } = useSocket();
   console.log('Socket connected:', isConnected);
   ```

### Audio Not Transmitting

1. Verify WebRTC peer connections established
2. Check ICE candidates exchanged
3. Verify local/remote descriptions set
4. Check browser Developer Tools → WebRTC stats

### Teacher Not Receiving Student's Microphone Request

1. Verify `audio:micRequest` socket event fired
2. Check socket is in correct room
3. Verify teacher is in same room

---

## Future Enhancements

- [ ] Recording and playback
- [ ] Audio quality indicators
- [ ] Volume controls and muting
- [ ] Echo test before joining
- [ ] Screen sharing with audio sync
- [ ] Audio transcription
- [ ] Noise cancellation settings
- [ ] Multiple room server for scaling

---

## Summary of Changes

### Files Created
- `client/src/services/` - API services layer
- `client/src/hooks/useAudio.js` - Audio management hook
- `client/src/utils/audioManager.js` - WebRTC utilities
- `client/src/utils/validation.js` - Form validation
- `client/src/components/layout/` - Layout components
- `client/src/components/audio/` - Audio components
- `client/src/components/quiz/QuizPanel.jsx` - Quiz UI
- `client/src/components/reactions/ReactionPanel.jsx` - Reactions UI
- `client/src/components/common/ErrorBoundary.jsx` - Error handling
- `server/src/sockets/audio.socket.js` - Audio server handler

### Files Modified
- `server/src/sockets/index.js` - Added audio socket setup
- `client/src/utils/socketEvents.js` - Added audio socket events

### Total Components/Hooks Created
- 1 Custom Hook (useAudio)
- 8 UI Components
- 1 Error Boundary
- 6 API Service modules
- 1 Socket event handler
- 2 Utility modules (audioManager, validation)

All features are production-ready with proper error handling, validation, and security measures!
