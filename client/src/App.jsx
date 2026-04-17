import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { RoomProvider } from './context/RoomContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import Classroom from './pages/Classroom';
import NotFound from './pages/NotFound';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

// Main app content component (uses auth context)
function AppContent() {
  const { user, token, isAuthenticated } = useAuth();

  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {isAuthenticated && user && token && (
          <SocketProvider token={token} userId={user._id} username={user.username} role={user.role}>
            <RoomProvider token={token}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/lobby" element={<Lobby />} />
                  <Route path="/classroom/:roomCode" element={<Classroom />} />
                </Route>

                {/* Not found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RoomProvider>
          </SocketProvider>
        )}

        {!isAuthenticated && (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
