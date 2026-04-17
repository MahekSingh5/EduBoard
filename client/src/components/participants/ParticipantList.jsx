import { useAuth } from '../../hooks/useAuth';

export default function ParticipantList({ participants }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const participantMap = new Map();

  participants.forEach((participant) => {
    if (!participant?.userId) return;
    participantMap.set(participant.userId, participant);
  });

  if (currentUserId && !participantMap.has(currentUserId)) {
    participantMap.set(currentUserId, {
      userId: currentUserId,
      username: user?.username,
      role: user?.role,
    });
  }

  const displayParticipants = Array.from(participantMap.values()).sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return (a.username || '').localeCompare(b.username || '');
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">👥 Participants</h2>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayParticipants.map((participant) => {
          const isCurrentUser = participant.userId === currentUserId;

          return (
          <div
            key={participant.userId}
            className={`p-3 rounded flex items-center gap-2 ${
              isCurrentUser ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <span className={`w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm ${
              isCurrentUser ? 'bg-blue-600' : 'bg-gray-600'
            }`}>
              {participant.username?.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-bold text-sm">{participant.username}</p>
              <p className="text-xs text-gray-600 capitalize">
                {participant.role || 'participant'}{isCurrentUser ? ' (You)' : ''}
              </p>
            </div>
          </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        {displayParticipants.length} participant{displayParticipants.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
