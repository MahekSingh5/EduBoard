import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';

export default function Lobby() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { createRoom } = useRoom();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomForm, setRoomForm] = useState({ name: '', description: '' });

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const room = await createRoom(roomForm.name, roomForm.description);
      setRoomForm({ name: '', description: '' });
      setShowCreateRoom(false);
      navigate(`/classroom/${room.code}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create room';
      setError(errorMsg);
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      navigate(`/classroom/${joinCode.toUpperCase()}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to join room';
      setError(errorMsg);
      console.error('Failed to join room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              EB
            </div>
            <h1 className="text-2xl font-bold text-white">EduBoard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-white font-semibold">{user?.username}</p>
              <p className="text-gray-300 text-sm capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 rounded-lg transition-all duration-300 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.username.split(' ')[0]}</span>!
          </h2>
          <p className="text-gray-300 text-lg">Ready to {user?.role === 'teacher' ? 'teach' : 'learn'} today?</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm flex items-center gap-3 animate-slide-up">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Create/Start Room */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl hover:border-white/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-2xl">
                🎓
              </div>
              <h3 className="text-2xl font-bold text-white">
                {user?.role === 'teacher' ? 'Create Classroom' : 'Start Learning'}
              </h3>
            </div>

            {user?.role === 'teacher' ? (
              !showCreateRoom ? (
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <span>➕</span> Create New Classroom
                </button>
              ) : (
                <form onSubmit={handleCreateRoom} className="space-y-4 animate-slide-up">
                  <input
                    type="text"
                    placeholder="Classroom Name (e.g., Mathematics 101)"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                  <textarea
                    placeholder="Description (what will you teach?)"
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/10 transition-all duration-300 resize-none"
                    rows="3"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || !roomForm.name.trim()}
                      className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '⏳ Creating...' : '✅ Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateRoom(false)}
                      className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )
            ) : (
              <p className="text-gray-300">Join a classroom to start your learning journey today!</p>
            )}
          </div>

          {/* Join Room */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl hover:border-white/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-2xl">
                🚪
              </div>
              <h3 className="text-2xl font-bold text-white">Join Classroom</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Room Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white text-center text-2xl font-bold placeholder-gray-400 focus:border-purple-400 focus:bg-white/10 transition-all duration-300 tracking-widest"
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={loading || !joinCode.trim() || joinCode.length < 6}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <>⏳ Joining...</> : <>✨ Join Classroom</>}
              </button>
            </div>
          </div>
        </div>

        {user?.role === 'teacher' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-white mb-2">Start a Classroom</h3>
            <p className="text-gray-300">Create a new room or share a room code when you are ready.</p>
          </div>
        )}
      </div>
    </div>
  );
}
