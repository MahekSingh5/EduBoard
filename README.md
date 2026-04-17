# EduBoard - Real-Time Collaborative Educational Platform

A comprehensive web-based platform for interactive learning with real-time collaboration features including whiteboard, live chat, quizzes, hand raising, reactions, and screen sharing.

## 🌟 Features

✅ **User Authentication** - Secure JWT-based authentication with teacher/student roles
✅ **Classroom Management** - Create and join virtual classrooms with unique codes
✅ **Real-time Whiteboard** - Collaborative drawing with multiple colors and brush sizes
✅ **Live Chat** - Instant messaging with message editing, deletion, and reactions
✅ **Quiz System** - Create, manage, and conduct interactive quizzes with auto-grading
✅ **Hand Raising** - Students can signal the teacher for questions
✅ **Emoji Reactions** - Real-time feedback with emoji reactions
✅ **Screen Sharing** - Teachers can share their screen via WebRTC
✅ **Persistent Data** - MongoDB for storing all classroom data
✅ **Real-time Updates** - Socket.IO for instant synchronization

## 📋 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js + Express** - Web server
- **Socket.IO** - WebSocket communication
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Infrastructure
- **WebRTC** - Screen sharing
- **Canvas API** - Whiteboard drawing

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB (local or cloud)
- npm or yarn

### 1. Backend Setup

```bash
cd server
npm install

# Create .env file
echo "PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/edu-collab-platform
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173" > .env

# Start MongoDB (if local)
mongod

# Start backend server
npm run dev
```

Server will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd client
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 📐 Project Structure

```
edu-collab-platform/
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── config/                 # Database & environment configs
│   │   ├── controllers/            # Route handlers
│   │   ├── middleware/             # Auth & error handling
│   │   ├── models/                 # MongoDB schemas
│   │   ├── routes/                 # API endpoints
│   │   ├── sockets/                # Socket.IO event handlers
│   │   ├── utils/                  # Helper functions
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Server entry point
│   ├── .env                        # Environment variables
│   ├── package.json
│   └── README.md
│
└── client/                          # React frontend
    ├── public/
    ├── src/
    │   ├── assets/                 # Images, icons
    │   ├── components/             # React components
    │   │   ├── common/            # Reusable UI components
    │   │   ├── layout/            # Layout components
    │   │   ├── whiteboard/        # Whiteboard features
    │   │   ├── chat/              # Chat features
    │   │   ├── quiz/              # Quiz features
    │   │   ├── participants/      # Participant list
    │   │   ├── reactions/         # Reaction components
    │   │   └── screenshare/       # Screen sharing
    │   ├── context/               # React Context
    │   ├── hooks/                 # Custom hooks
    │   ├── pages/                 # Page components
    │   ├── services/              # API services
    │   ├── utils/                 # Utilities & constants
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── README.md
```

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/edu-collab-platform

# Authentication
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Client (.env.local)** (Optional)
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user
PUT    /api/auth/profile           Update profile
```

### Rooms
```
POST   /api/rooms                   Create room (teacher)
GET    /api/rooms/teacher/rooms    Get teacher's rooms
GET    /api/rooms/code/:code       Get room by code
POST   /api/rooms/:code/join       Join room
POST   /api/rooms/:roomId/leave    Leave room
```

### Chat
```
GET    /api/rooms/:roomId/chat/messages              Get messages
POST   /api/rooms/:roomId/chat/messages              Send message
PUT    /api/rooms/:roomId/chat/messages/:msgId       Edit message
DELETE /api/rooms/:roomId/chat/messages/:msgId       Delete message
POST   /api/rooms/:roomId/chat/messages/:msgId/reaction  Add reaction
```

### Quiz
```
POST   /api/rooms/:roomId/quiz                    Create quiz (teacher)
GET    /api/rooms/:roomId/quiz                    Get quizzes
POST   /api/rooms/:roomId/quiz/:quizId/start      Start quiz (teacher)
POST   /api/rooms/:roomId/quiz/:quizId/end        End quiz (teacher)
POST   /api/rooms/:roomId/quiz/:quizId/submit     Submit answers
GET    /api/rooms/:roomId/quiz/:quizId/results    Get results
```

### Whiteboard
```
GET    /api/rooms/:roomId/board                        Get board
POST   /api/rooms/:roomId/board/:boardId/save         Save canvas
POST   /api/rooms/:roomId/board/:boardId/clear        Clear board
POST   /api/rooms/:roomId/board/:boardId/undo         Undo action
GET    /api/rooms/:roomId/board/:boardId/history      Get history
```

## 🔌 Socket.IO Events

### Room Events
- `room:join` - Join a room
- `room:leave` - Leave a room
- `room:raise-hand` - Raise hand to speak
- `room:lower-hand` - Lower hand
- `room:user-joined` - User joined event
- `room:user-left` - User left event

### Chat Events
- `chat:send-message` - Send message
- `chat:new-message` - New message received
- `chat:typing` - User is typing
- `chat:stop-typing` - User stopped typing
- `chat:edit-message` / `chat:message-edited` - Edit message
- `chat:delete-message` / `chat:message-deleted` - Delete message
- `chat:add-reaction` / `chat:reaction-added` - Add reaction

### Whiteboard Events
- `whiteboard:draw` - Send stroke
- `whiteboard:stroke-received` - Receive stroke
- `whiteboard:clear` / `whiteboard:cleared` - Clear canvas
- `whiteboard:undo` / `whiteboard:undo-action` - Undo
- `whiteboard:color-change` / `whiteboard:color-changed` - Color change

### Quiz Events
- `quiz:start` / `quiz:started` - Start quiz
- `quiz:next-question` / `quiz:question-show` - Show question
- `quiz:submit-answer` / `quiz:answer-submitted` - Submit answer
- `quiz:end` / `quiz:ended` - End quiz

### Reaction Events
- `reaction:send` / `reaction:received` - Send emoji reaction

### WebRTC Events
- `webrtc:request-screen-share` / `webrtc:screen-share-started` - Start sharing
- `webrtc:stop-screen-share` / `webrtc:screen-share-stopped` - Stop sharing
- `webrtc:send-offer` / `webrtc:receive-offer` - WebRTC offer
- `webrtc:send-answer` / `webrtc:receive-answer` - WebRTC answer
- `webrtc:send-ice-candidate` / `webrtc:receive-ice-candidate` - ICE candidate

## 🎯 User Roles

### Teacher
- Create classrooms
- Start/end quizzes
- Share screen
- Control classroom settings
- View student progress

### Student
- Join classrooms
- Participate in quizzes
- Raise hand
- Send reactions
- View whiteboard

## 📝 Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: String (teacher/student),
  profileImage: String,
  bio: String,
  rooms: [RoomId],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Room
```javascript
{
  title: String,
  roomCode: String (unique, 6 chars),
  teacher: UserId,
  students: [{userId, joinedAt, isActive}],
  settings: {allowChat, allowRaiseHand, allowScreenShare, allowReactions, allowQuiz},
  messages: [MessageId],
  boardData: String (JSON),
  isActive: Boolean,
  maxStudents: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  room: RoomId,
  sender: UserId,
  content: String,
  messageType: String (text/system),
  reactions: [{emoji, users: [UserId]}],
  isEdited: Boolean,
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz
```javascript
{
  room: RoomId,
  creator: UserId,
  title: String,
  questions: [{id, question, type, options, correctAnswer, points}],
  responses: [{userId, answers: [{questionId, answer, isCorrect}], score}],
  isActive: Boolean,
  showResults: Boolean,
  startTime: Date,
  endTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ Input validation using express-validator
- ✅ Protected routes with authentication middleware

## 🚢 Deployment

### Backend Deployment
Deploy to: Railway, Render, Heroku, or AWS

```bash
# Set production environment variables
# Deploy code
# MongoDB Atlas for database hosting
```

### Frontend Deployment
Deploy to: Vercel, Netlify, or GitHub Pages

```bash
npm run build
# Deploy dist folder
```

## 📖 Beginner's Guide

### For Teachers
1. Register with a **teacher** role
2. Go to Lobby
3. Click "Create Classroom"
4. Share the room code with students
5. Click on your classroom to start teaching
6. Use the whiteboard, chat, and quiz features

### For Students
1. Register with a **student** role
2. Go to Lobby
3. Enter the room code provided by teacher
4. Click "Join Classroom"
5. Participate in the classroom activities

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running locally or use MongoDB Atlas connection string
- Check MONGO_URI in .env

### Socket.IO Connection Issues
- Verify backend is running on correct port
- Check CORS_ORIGIN setting
- Clear browser cache and reconnect

### Canvas Not Drawing
- Ensure WebGL context is available
- Try a different browser
- Check browser console for errors

### Real-time Updates Not Working
- Check Socket.IO connection in browser DevTools
- Verify server is emitting events correctly
- Check room ID matches

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 📄 License

ISC

## 🎓 Learning Outcomes

By building this project, you'll learn:
- Real-time communication with WebSockets (Socket.IO)
- React state management with Context API
- REST API design and implementation
- MongoDB database design
- Authentication and authorization
- Canvas API for drawing
- WebRTC basics
- Responsive UI design with Tailwind CSS

---

**Happy Collaborating! 🚀✨**
