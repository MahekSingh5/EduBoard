# EduBoard - Frontend

React-based front-end for the EduBoard collaborative learning platform built with Vite, Tailwind CSS, and Socket.IO.

## Features

✅ **Authentication Pages** - Login and registration with role selection
✅ **Classroom Lobby** - Join or create classrooms
✅ **Real-time Whiteboard** - Collaborative drawing canvas
✅ **Live Chat** - Instant messaging with reactions
✅ **Participant List** - View active participants
✅ **Quiz Interface** - Take and submit quizzes
✅ **Responsive Design** - Works on desktop and tablet
✅ **Real-time Updates** - Instant synchronization via Socket.IO

## Prerequisites

- Node.js v14+
- npm or yarn
- Backend server running on `http://localhost:5000`

## Installation

```bash
# Install dependencies
npm install

# Create .env.local (optional)
echo "VITE_SOCKET_URL=http://localhost:5000" > .env.local
```

## Development

```bash
# Start development server with hot reload
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
client/src/
├── assets/              # Images and static files
├── components/          # React components
│   ├── common/         # Reusable UI components (Button, Modal, Loader)
│   ├── layout/         # Layout components
│   ├── whiteboard/     # Whiteboard components
│   ├── chat/           # Chat components
│   ├── quiz/           # Quiz components
│   ├── participants/   # Participant list
│   ├── reactions/      # Reaction components
│   └── screenshare/    # Screen sharing components
├── context/             # React Context
│   ├── AuthContext.jsx   # User authentication
│   ├── SocketContext.jsx # Socket.IO management
│   └── RoomContext.jsx   # Room management
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Auth hook
│   ├── useSocket.js    # Socket hook
│   ├── useRoom.js      # Room hook
│   ├── useChat.js      # Chat hook
│   ├── useWhiteboard.js # Whiteboard hook
│   ├── useQuiz.js      # Quiz hook
│   ├── useReactions.js # Reactions hook
│   └── useWebRTC.js    # WebRTC hook
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Lobby.jsx       # Classroom lobby
│   ├── Classroom.jsx   # Main classroom page
│   └── NotFound.jsx    # 404 page
├── services/           # API services (for REST calls)
├── utils/              # Utilities and constants
│   ├── socketEvents.js # Socket event names
│   ├── helpers.js      # Helper functions
│   ├── constants.js    # App constants
│   └── generateRoomId.js # Room ID generator
├── App.jsx            # Main app component with routing
├── main.jsx           # React entry point
└── index.css          # Global styles
```

## Custom Hooks

### useAuth()
Access authentication context
```javascript
const { user, token, login, register, logout, isTeacher } = useAuth();
```

### useSocket()
Access Socket.IO connection
```javascript
const { socket, emit, on, off, isConnected } = useSocket();
```

### useRoom()
Access room management
```javascript
const { currentRoom, rooms, createRoom, joinRoom, leaveRoom } = useRoom();
```

### useChat(roomId, token)
Manage chat messages
```javascript
const { messages, sendMessage, editMessage, deleteMessage, addReaction } = useChat(roomId, token);
```

### useWhiteboard(roomId)
Control whiteboard drawing
```javascript
const { canvasRef, color, brushSize, draw, clearCanvas } = useWhiteboard(roomId);
```

### useQuiz(roomId, token)
Manage quizzes
```javascript
const { quizzes, currentQuiz, startQuiz, submitAnswer } = useQuiz(roomId, token);
```

### useReactions(roomId)
Send and receive reactions
```javascript
const { reactionCounts, sendReaction } = useReactions(roomId);
```

### useWebRTC(roomId, userId, isTeacher)
Screen sharing functionality
```javascript
const { isScreenSharing, screenStream, startScreenShare, stopScreenShare } = useWebRTC(roomId, userId, isTeacher);
```

## Components

### Common Components
- **Button.jsx** - Reusable button with variants
- **Modal.jsx** - Modal dialog component
- **Loader.jsx** - Loading spinner
- **ProtectedRoute.jsx** - Route protection wrapper

### Feature Components
- **WhiteboardCanvas.jsx** - Drawing canvas
- **ChatPanel.jsx** - Chat interface
- **ParticipantList.jsx** - Active participants
- **QuizPanel.jsx** - Quiz interface
- **ReactionBar.jsx** - Reaction emoji selector

## State Management

The app uses React Context API for global state:

1. **AuthContext** - User authentication and profile
2. **SocketContext** - Socket.IO connection management
3. **RoomContext** - Room operations and management

## API Integration

Axios is configured to make REST API calls with automatic authentication token injection:

```javascript
// Example API call
const response = await axios.get('/api/rooms', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Real-time Communication

Socket.IO events are organized by feature:
- `room:*` - Room events
- `chat:*` - Chat events
- `whiteboard:*` - Whiteboard events
- `quiz:*` - Quiz events
- `reaction:*` - Reaction events
- `webrtc:*` - WebRTC events

## Styling

The app uses Tailwind CSS for styling with custom configuration:

```javascript
// tailwind.config.js
theme: {
  colors: {
    primary: '#3B82F6',
    secondary: '#1F2937',
    accent: '#F59E0B',
  }
}
```

### Color Palette
- **Primary Blue** - #3B82F6
- **Dark Gray** - #1F2937
- **Accent Yellow** - #F59E0B

## Environment Variables

Optional environment variables in `.env.local`:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

If not set, defaults will be used.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Lazy loading of components
- Memoization with useCallback
- Efficient re-renders with Context
- Canvas optimization for whiteboard
- Message pagination

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance

## Dependencies

### Core
- `react@^18.2.0` - UI framework
- `react-dom@^18.2.0` - DOM rendering
- `react-router-dom@^6.14.0` - Navigation

### Real-time & API
- `socket.io-client@^4.7.1` - WebSocket client
- `axios@^1.4.0` - HTTP client

### Styling
- `tailwindcss@^3.3.2` - Utility CSS framework

### Dev Dependencies
- `@vitejs/plugin-react@^4.0.3` - React plugin for Vite
- `vite@^4.4.5` - Build tool

## Development Tips

1. **Debug Socket Events** - Open the socket namespace in DevTools network tab
2. **Canvas Issues** - Use Firefox debugger to inspect canvas element
3. **State Issues** - React DevTools extension helps debug Context state
4. **API Issues** - Check Network tab in DevTools for request/response

## Common Issues

### Socket.IO Not Connecting
- Check backend is running
- Verify VITE_SOCKET_URL is correct
- Check browser console for errors

### Canvas Not Rendering
- Ensure canvas ref is properly set
- Check browser supports Canvas API
- Verify WebGL context

### Component Not Updating
- Verify state is being set correctly
- Check useEffect dependencies
- Ensure proper key props for lists

## Best Practices

1. Always use hooks for state management
2. Keep components focused and single-responsibility
3. Use custom hooks to share logic
4. Proper error handling in try-catch
5. Clean up subscriptions in useEffect cleanup
6. Use loading and error states
7. Validate inputs before sending

## Future Enhancements

- [ ] Image uploading in chat
- [ ] File sharing
- [ ] User profiles
- [ ] Classroom notifications
- [ ] Quiz analytics dashboard
- [ ] Dark mode
- [ ] Mobile app version
- [ ] Offline support

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

ISC

---

**Built with ❤️ for collaborative learning**
