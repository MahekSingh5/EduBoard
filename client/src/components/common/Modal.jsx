export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-3xl text-gray-400 hover:text-gray-600 transition-colors duration-300 hover:bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="p-6 text-gray-700">{children}</div>
      </div>
    </div>
  );
}
