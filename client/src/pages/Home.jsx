import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/lobby');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    { icon: '📚', title: 'Virtual Classrooms', desc: 'Create and manage interactive virtual classrooms' },
    { icon: '🎨', title: 'Smart Whiteboard', desc: 'Collaborative drawing with real-time sync' },
    { icon: '💬', title: 'Live Chat', desc: 'Real-time messaging and emoji reactions' },
    { icon: '📝', title: 'Interactive Quizzes', desc: 'Engage students with instant quizzes' },
    { icon: '✋', title: 'Raise Hand', desc: 'Students request to speak seamlessly' },
    { icon: '🖥️', title: 'Screen Sharing', desc: 'Share your screen for better explanations' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              EB
            </div>
            <h1 className="text-3xl font-bold text-white hidden sm:block">EduBoard</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-lg font-semibold text-white border-2 border-white/30 hover:border-white/60 backdrop-blur transition-all duration-300 hover:bg-white/10"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="animate-fade-in">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Real-time 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Collaborative Learning
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect, collaborate, and learn together in a modern virtual classroom platform. Featuring live chat, interactive whiteboard, and real-time collaboration tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              Start Free Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-white/40 hover:border-white/80 text-white font-bold text-lg rounded-xl backdrop-blur transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-4xl font-bold text-white text-center mb-16">Powerful Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:border-white/40 hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">10K+</div>
            <p className="text-gray-300 text-lg">Active Users</p>
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-2">500+</div>
            <p className="text-gray-300 text-lg">Classrooms</p>
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300 mb-2">99%</div>
            <p className="text-gray-300 text-lg">Uptime</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 backdrop-blur-md bg-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-300">
          <p>© 2026 EduBoard. All rights reserved. | Made with ❤️ for educators</p>
        </div>
      </footer>
    </div>
  );
}
