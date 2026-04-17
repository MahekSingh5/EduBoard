import { useAuth } from '../../hooks/useAuth';

export default function ClassroomSidebar({ isOpen, onClose, activeTab, onTabChange, hasRaisedHand }) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const tabs = [
    { id: 'board', label: '📋 Whiteboard', icon: '📋' },
    { id: 'chat', label: '💬 Chat', icon: '💬' },
    { id: 'participants', label: '👥 Participants', icon: '👥' },
    { id: 'quiz', label: '📝 Quiz', icon: '📝' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-20 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:border-b-0">
          <h2 className="font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="flex-1">{tab.label}</span>
              {tab.id === 'participants' && hasRaisedHand && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                  !
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Info section */}
        <div className="p-4 border-t border-gray-200">
          {isTeacher ? (
            <div className="bg-blue-50 p-3 rounded text-xs text-blue-900">
              <p className="font-semibold">👨‍🏫 Teacher Controls</p>
              <p className="mt-1">Approve mic requests and manage class settings</p>
            </div>
          ) : (
            <div className="bg-green-50 p-3 rounded text-xs text-green-900">
              <p className="font-semibold">👨‍🎓 Student Mode</p>
              <p className="mt-1">Request permission to speak</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
