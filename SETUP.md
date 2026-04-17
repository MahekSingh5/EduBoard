# 🚀 EduBoard - Complete Setup Guide

## ⚡ Quick Start (5 minutes)

### Step 1: Install Node.js
Download from [nodejs.org](https://nodejs.org/) - LTS version

### Step 2: MongoDB Setup

#### Option A: Local MongoDB (macOS)
```bash
# Install with Homebrew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Test connection
mongosh
> show dbs
> exit()
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `server/.env` with connection string

### Step 3: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with the provided variables
# Use the template in this directory

# Start backend server
npm run dev
```

**✓ Backend running on: http://localhost:5000**

### Step 4: Frontend Setup

```bash
# Open new terminal, navigate to client
cd client

# Install dependencies
npm install

# Start frontend
npm run dev
```

**✓ Frontend running on: http://localhost:5173**

### Step 5: Test the App

1. Open browser: `http://localhost:5173`
2. Register as Teacher
3. Create a classroom
4. Open incognito window, register as Student
5. Join using room code
6. Test whiteboard, chat, and other features

---

## 📝 Full Installation Guide

### Prerequisites Check
```bash
# Check Node version (should be v14+)
node --version

# Check npm version
npm --version

# Check MongoDB (if local)
mongod --version
```

### Backend Installation

#### 1. Navigate to Server
```bash
cd /Users/mahek/Desktop/EduBoard/server
```

#### 2. Install Dependencies
```bash
npm install
```

**Installed packages:**
- express - Web framework
- socket.io - Real-time communication
- mongoose - Database ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT auth
- cors - Cross-origin support
- dotenv - Environment config
- express-async-handler - Async errors

#### 3. Configure Environment

Create `.env` file:
```bash
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/edu-collab-platform
JWT_SECRET=your_super_secret_jwt_key_change_in_production_abc123xyz
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
EOF
```

#### 4. Ensure MongoDB is Running
```bash
# For macOS with Homebrew
brew services start mongodb-community

# For Linux
sudo systemctl start mongod

# For Windows
# MongoDB should be installed as a service
```

#### 5. Start Backend
```bash
npm run dev
```

Expected output:
```
✓ MongoDB Connected: localhost
✓ Server running on port 5000
✓ Environment: development
✓ CORS Origin: http://localhost:5173
```

---

### Frontend Installation

#### 1. Navigate to Client
```bash
cd /Users/mahek/Desktop/EduBoard/client
```

#### 2. Install Dependencies
```bash
npm install
```

**Installed packages:**
- react & react-dom - UI framework
- react-router-dom - Navigation
- socket.io-client - WebSocket client
- axios - HTTP client
- tailwindcss - CSS framework

#### 3. Verify Backend URL

The app is configured to connect to `http://localhost:5001` by default.

Optional: Create `.env.local` for custom settings:
```bash
cat > .env.local << 'EOF'
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
EOF
```

#### 4. Start Frontend
```bash
npm run dev
```

Expected output:
```
VITE v4.4.5  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 🎯 Usage Guide

### For Teachers

#### Creating a Classroom
1. Log in with teacher account
2. Click "Create Classroom"
3. Enter classroom name and description
4. Get the room code (e.g., ABCD12)
5. Share code with students

#### Starting a Class
1. Click your classroom in the list
2. Share the room code with students
3. Wait for students to join (visible in Participants)
4. Use whiteboard to teach
5. Send quiz to assess learning

#### Features
- **Whiteboard**: Draw, write, clear, undo
- **Chat**: Send messages, react with emojis
- **Quiz**: Create quiz, define questions, view results
- **Hand Raising**: See which students raised their hands
- **Screen Sharing**: Share your screen with students

### For Students

#### Joining a Classroom
1. Log in with student account
2. Enter room code (provided by teacher)
3. Click "Join Classroom"
4. Start participating!

#### Participation
- **Chat**: Send messages and reactions
- **Whiteboard**: View teacher's drawings
- **Hand Raising**: ✋ Click to get teacher's attention
- **Quiz**: Answer quiz questions
- **Reactions**: Send emoji reactions

---

## 🧪 Testing

### Test Account 1: Teacher
```
Username: teacher1
Email: teacher@example.com
Password: pass123
Role: Teacher
```

### Test Account 2: Student
```
Username: student1
Email: student@example.com
Password: pass123
Role: Student
```

### Manual Testing

#### 1. Authentication Flow
- [ ] Register new account
- [ ] Login with credentials
- [ ] Update profile
- [ ] Logout

#### 2. Room Management
- [ ] Create new room (teacher)
- [ ] Get room code
- [ ] Join room with code (student)
- [ ] Leave room
- [ ] View participant list

#### 3. Whiteboard
- [ ] Draw on canvas
- [ ] Change brush color
- [ ] Change brush size
- [ ] Clear canvas
- [ ] See drawing from other user in real-time

#### 4. Chat
- [ ] Send message
- [ ] See message appear instantly
- [ ] Edit message
- [ ] Delete message
- [ ] Add emoji reaction
- [ ] See typing indicator

#### 5. Quiz
- [ ] Create quiz (teacher)
- [ ] Add questions
- [ ] Start quiz
- [ ] Submit answers (student)
- [ ] View results
- [ ] End quiz

#### 6. Real-time Features
- [ ] Room events sync in real-time
- [ ] User join/leave notifications
- [ ] Hand raising notifications
- [ ] Emoji reactions appear instantly

---

## 🐛 Troubleshooting

### "Failed to connect to MongoDB"
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (macOS)
brew services start mongodb-community

# Check connection string in .env
```

### "EADDRINUSE - Port 5000 already in use"
```bash
# Find process using port 5000 (macOS/Linux)
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
# Change PORT in server/.env
```

### "Socket.IO connection failed"
```
Issues:
1. Backend not running - Start npm run dev in server folder
2. Wrong CORS origin - Check CORS_ORIGIN in .env
3. Firewall blocking - Allow port 5000
4. Network issue - Try localhost instead of 127.0.0.1
```

### "MongoDB authentication error"
```
Issues:
1. Wrong connection string - Check MONGO_URI in .env
2. Database doesn't exist - MongoDB creates it automatically
3. User credentials wrong - For Atlas, add username/password to connection string
```

### "Canvas not drawing"
```
Issues:
1. Browser doesn't support Canvas API - Use modern browser
2. WebGL not available - Check browser settings
3. Component not mounted - Check console for errors
```

### "Messages not syncing in real-time"
```
Issues:
1. Socket not connected - Check browser console
2. Room ID mismatch - Verify room code
3. Network latency - Check network speed
```

---

## 🚀 Deployment

### Deploy Backend

#### Using Railway ([railway.app](https://railway.app))
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables in dashboard
# Connect MongoDB Atlas

# Deploy
deploy
```

#### Using Render ([render.com](https://render.com))
1. Push code to GitHub
2. Connect repository
3. Create new Web Service
4. Set environment variables
5. Deploy

### Deploy Frontend

#### Using Vercel ([vercel.com](https://vercel.com))
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client folder
vercel
```

#### Using Netlify
1. Push code to GitHub
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy

---

## 📊 Project Statistics

### Backend
- 5 Models (User, Room, Message, Quiz, Board)
- 5 Controllers (auth, room, chat, quiz, board)
- 5 Routes + 3 Middleware
- 7 Socket.IO handlers

### Frontend
- 6 Pages (Home, Login, Register, Lobby, Classroom, NotFound)
- 7 Custom Hooks
- 3 React Context
- 15+ Components
- 100% built with Tailwind CSS

### Database
- MongoDB collections
- 50+ API endpoints
- Real-time Socket.IO events

---

## 📚 Learning Resources

- [MERN Stack Guide](https://www.mongodb.com/languages/mern-stack)
- [Socket.IO Tutorial](https://socket.io/docs/v4/server-api/)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Mongoose Schemas](https://mongoosejs.com/docs/guide.html)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend API responds: `curl http://localhost:5000/api/health`
- [ ] Frontend loads: `http://localhost:5173`
- [ ] Can register new account
- [ ] Can login
- [ ] Can create room (as teacher)
- [ ] Can join room (as student)
- [ ] Can draw on whiteboard
- [ ] Can send messages
- [ ] Real-time updates working
- [ ] Socket.IO connected (check DevTools)

---

## 📞 Support

Having issues? Check:
1. Terminal output for error messages
2. Browser console (F12) for client errors
3. MongoDB connection string
4. Port availability
5. Node version compatibility

---

## 🎉 Success!

Congratulations! Your EduBoard is ready!

Next steps:
1. Customize colors and branding
2. Add more quiz types
3. Implement video conferencing
4. Add notifications
5. Create admin dashboard
6. Deploy to production

**Happy Learning & Teaching! 🚀✨**
