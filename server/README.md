# EduBoard - Backend Server

A real-time collaborative educational platform backend built with Node.js, Express, Socket.IO, and MongoDB.

## Features

✅ **User Authentication** - JWT-based auth with role-based access control (teacher/student)
✅ **Room Management** - Create and manage classroom rooms with unique room codes
✅ **Real-time Chat** - Live messaging with edit/delete/reactions
✅ **Interactive Whiteboard** - Collaborative drawing canvas with undo/clear
✅ **Quiz System** - Create, manage, and conduct quizzes with auto-grading
✅ **Hand Raising** - Students can raise hands to ask questions
✅ **Reactions** - Emoji reactions for real-time feedback
✅ **Screen Sharing** - WebRTC-based screen sharing for teachers
✅ **MongoDB Integration** - Persistent data storage with Mongoose

## Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create `.env` file in the server directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/edu-collab-platform
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Ensure MongoDB is running:**
   ```bash
   # If using local MongoDB
   mongod
   ```

## Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files (db.js, env.js)
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, role, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── sockets/         # Socket.IO event handlers
│   ├── utils/           # Helper functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env                # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Rooms
- `POST /api/rooms` - Create room (teacher)
- `GET /api/rooms/teacher/rooms` - Get teacher's rooms
- `GET /api/rooms/code/:code` - Get room by code
- `POST /api/rooms/:code/join` - Join room (student)
- `POST /api/rooms/:roomId/leave` - Leave room

### Chat (nested under room)
- `GET /api/rooms/:roomId/chat/messages` - Get messages
- `POST /api/rooms/:roomId/chat/messages` - Send message
- `PUT /api/rooms/:roomId/chat/messages/:messageId` - Edit message
- `DELETE /api/rooms/:roomId/chat/messages/:messageId` - Delete message
- `POST /api/rooms/:roomId/chat/messages/:messageId/reaction` - Add reaction

### Quiz (nested under room)
- `POST /api/rooms/:roomId/quiz` - Create quiz (teacher)
- `GET /api/rooms/:roomId/quiz` - Get quizzes
- `GET /api/rooms/:roomId/quiz/:quizId` - Get single quiz
- `POST /api/rooms/:roomId/quiz/:quizId/start` - Start quiz (teacher)
- `POST /api/rooms/:roomId/quiz/:quizId/end` - End quiz (teacher)
- `POST /api/rooms/:roomId/quiz/:quizId/submit` - Submit answers
- `GET /api/rooms/:roomId/quiz/:quizId/results` - Get results

### Whiteboard (nested under room)
- `GET /api/rooms/:roomId/board` - Get board
- `POST /api/rooms/:roomId/board/:boardId/save` - Save canvas
- `POST /api/rooms/:roomId/board/:boardId/clear` - Clear board
- `POST /api/rooms/:roomId/board/:boardId/undo` - Undo action
- `GET /api/rooms/:roomId/board/:boardId/history` - Get history
- `POST /api/rooms/:roomId/board/:boardId/thumbnail` - Save thumbnail

## Socket.IO Events

### Room Events
- `room:join` - Join a room
- `room:leave` - Leave a room
- `room:raise-hand` - Raise hand
- `room:lower-hand` - Lower hand

### Chat Events
- `chat:send-message` - Send message
- `chat:typing` - User typing
- `chat:edit-message` - Edit message
- `chat:delete-message` - Delete message
- `chat:add-reaction` - Add message reaction

### Whiteboard Events
- `whiteboard:draw` - Send drawing stroke
- `whiteboard:clear` - Clear canvas
- `whiteboard:undo` - Undo action
- `whiteboard:color-change` - Change brush color

### Quiz Events
- `quiz:start` - Start quiz
- `quiz:next-question` - Show next question
- `quiz:submit-answer` - Submit answer
- `quiz:end` - End quiz

### Reaction Events
- `reaction:send` - Send emoji reaction
- `reaction:get-summary` - Get reaction count

### WebRTC Events
- `webrtc:request-screen-share` - Request screen sharing
- `webrtc:send-offer` - Send WebRTC offer
- `webrtc:send-answer` - Send WebRTC answer
- `webrtc:send-ice-candidate` - Send ICE candidate

## Database Models

### User
- username (unique)
- email (unique)
- password (hashed)
- role (student/teacher)
- profileImage
- bio
- rooms (array of Room IDs)

### Room
- code (unique room code)
- title
- teacher (User reference)
- students (array of Student objects)
- settings (chat, hand raising, screen share, reactions, quiz)
- messages (array of Message IDs)
- boardData

### Message
- room (Room reference)
- sender (User reference)
- content
- messageType (text/system)
- reactions (array)
- timestamp

### Quiz
- room (Room reference)
- creator (User reference)
- title
- questions (array)
- responses (array of student responses)
- isActive
- startTime, endTime

### Board
- room (Room reference)
- canvasData (serialized drawing data)
- history (array of actions)
- thumbnail

## Dependencies

### Main
- **express** - Web framework
- **socket.io** - Real-time communication
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **express-async-handler** - Async error handling

### Dev
- **nodemon** - Auto-reload during development

## Environment Variables

```env
PORT                 # Server port (default: 5000)
NODE_ENV            # Environment (development/production)
MONGO_URI           # MongoDB connection string
JWT_SECRET          # Secret key for JWT signing
JWT_EXPIRE          # JWT expiration time (default: 7d)
CORS_ORIGIN         # Frontend origin for CORS
```

## Error Handling

All errors are caught and standardized through the error middleware. Errors include:
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

## Security Features

- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ Input validation

## Development

### Testing API
- Use Postman or Insomnia
- Include `Authorization: Bearer <token>` header for protected routes
- Test Socket.IO events with Socket.IO client library

### Debug Logs
- Logs include connection info, user actions, errors
- Disable logs in production by modifying console.log statements

## Deployment

1. Set environment to production
2. Use MongoDB Atlas for database hosting
3. Deploy on services like Railway, Render, or Heroku
4. Ensure all environment variables are set
5. Use process manager like PM2 for production

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC

---

**Happy Teaching! 🎓**
