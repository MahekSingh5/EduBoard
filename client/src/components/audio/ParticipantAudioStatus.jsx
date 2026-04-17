import { useEffect, useState } from 'react';

export default function ParticipantAudioStatus({
  participants = [],
  speakingParticipants = new Set(),
}) {
  const [displayParticipants, setDisplayParticipants] = useState(participants);

  useEffect(() => {
    setDisplayParticipants(participants);
  }, [participants]);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">🎙️ Audio Status</h3>

      {displayParticipants.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded">
          <p className="text-gray-500 text-sm">No participants in class</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {displayParticipants.map((participant) => {
            const isSpeaking = speakingParticipants.has(participant.id);

            return (
              <div
                key={participant.id}
                className={`p-2 rounded-lg border transition-all ${
                  isSpeaking
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isSpeaking ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {participant.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Name and role */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {participant.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {participant.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <div className="ml-auto flex items-center gap-1">
                    {isSpeaking ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Speaking</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Silent</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mic permission status */}
                {participant.role === 'student' && (
                  <div className="mt-1 flex gap-1">
                    {participant.hasMicPermission ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        🎤 Mic enabled
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        🔇 No mic
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <p>💡 <span className="font-medium">Legend:</span></p>
        <p>🔴 Red pulse = User is currently speaking</p>
        <p>⚪ Gray dot = User is silent</p>
      </div>
    </div>
  );
}
