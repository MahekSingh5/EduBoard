import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData.username, formData.email, formData.password, formData.role);
      navigate('/lobby');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 py-12">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 mb-4 shadow-xl">
            <span className="text-white font-bold text-2xl">EB</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EduBoard</h1>
          <p className="text-gray-300">Join the learning revolution</p>
        </div>

        {/* Registration Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Create Account</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm flex items-center gap-3 animate-slide-up">
              <span className="text-xl">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-white font-semibold mb-2.5 text-sm">Full Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white font-semibold mb-2.5 text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white font-semibold mb-2.5 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-white font-semibold mb-2.5 text-sm">Join As</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  disabled={loading}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    formData.role === 'student'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  👨‍🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'teacher' })}
                  disabled={loading}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    formData.role === 'teacher'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  👨‍🏫 Teacher
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded" required />
              <span className="text-gray-300 text-sm">
                I agree to the <span className="text-blue-400 hover:text-blue-300">Terms of Service</span>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-300 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-400 text-xs">
          <p>Your account will be protected with military-grade encryption</p>
        </div>
      </div>
    </div>
  );
}
