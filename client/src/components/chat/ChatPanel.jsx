import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { REACTIONS } from '../../utils/socketEvents';

export default function ChatPanel({ messages, sendMessage, addReaction, typingUsers }) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      sendMessage(inputValue, user?.username, user?.profilePicture);
      setInputValue('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = useCallback((messageId, emoji) => {
    addReaction(messageId, emoji, user?.username);
    setSelectedReaction(null);
    setActiveMessageId(null);
  }, [addReaction, user?.username]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 flex items-center gap-3 border-b border-purple-700/20">
        <div className="text-2xl">💬</div>
        <div>
          <h2 className="text-lg font-bold">Class Chat</h2>
          <p className="text-purple-100 text-sm">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-5xl mb-3">💭</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const messageId = msg.id || msg._id;
            return (
            <div
              key={messageId}
              className={`${
                msg.type === 'system' || msg.messageType === 'system'
                  ? 'bg-blue-50 border border-blue-200 text-blue-700 text-center'
                  : 'group bg-white border border-gray-100 hover:shadow-md'
              } rounded-lg p-3 shadow-sm transition-all duration-300`}
              onMouseEnter={() => setActiveMessageId(messageId)}
              onMouseLeave={() => setActiveMessageId(null)}
            >
              {(msg.type === 'system' || msg.messageType === 'system') ? (
                <p className="text-sm font-medium">{msg.content}</p>
              ) : (
                <>
              {/* Message Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {msg.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{msg.username || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>
                {/* Reaction Button */}
                {activeMessageId === messageId && (
                  <div className="relative">
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                      {Object.values(REACTIONS).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(messageId, emoji)}
                          className="w-6 h-6 rounded hover:bg-white transition-all duration-200 flex items-center justify-center text-sm hover:scale-110"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <p className="text-sm text-gray-700 leading-relaxed pl-10">{msg.content}</p>

              {/* Reactions Display */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 pl-10">
                  {(() => {
                    const reactionCounts = {};
                    msg.reactions.forEach(({ emoji }) => {
                      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
                    });
                    return Object.entries(reactionCounts).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        {emoji} {count > 1 && count}
                      </span>
                    ));
                  })()}
                </div>
              )}
                </>
              )}
            </div>
          );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
            <span>{typingUsers.join(', ')} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="border-t border-gray-200 bg-white p-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
}
