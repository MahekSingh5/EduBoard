import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ClassroomHeader({ roomCode, roomName, onToggleSidebar }) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">{roomName || 'Classroom'}</h1>
            <p className="text-xs text-gray-500">Code: {roomCode}</p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <p className="px-3 py-2 text-sm text-gray-600">{user?.username}</p>
                  <p className="px-3 py-2 text-xs text-gray-500">{user?.email}</p>
                  <hr className="my-2" />
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                    Leave Class
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
