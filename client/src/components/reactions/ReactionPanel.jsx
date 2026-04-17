const EMOJI_REACTIONS = ['👍', '❤️', '😄', '😮', '😢', '🔥', '👏', '🎉'];

export default function ReactionPanel({ roomId }) {
  const handleReaction = (emoji) => {
    console.log('Reaction sent:', emoji);
    // TODO: Emit reaction via socket
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">😊 Reactions</h2>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-4">Click to send a reaction to the class:</p>
        
        <div className="flex flex-wrap gap-3">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-4xl p-2 rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-110 duration-200"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <span className="font-medium">Tip:</span> Use reactions to give real-time feedback without interrupting the class!
          </p>
        </div>
      </div>

      {/* Recent reactions (placeholder) */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Reactions</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm">No reactions yet...</p>
        </div>
      </div>
    </div>
  );
}
