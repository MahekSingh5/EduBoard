import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function AudioControls({
  isMicEnabled,
  hasMicPermission,
  micRequested,
  isLoading,
  onEnableMic,
  onDisableMic,
  onRequestMic,
  error,
}) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          🎤 Microphone
          {isMicEnabled && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
        </h3>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {isTeacher ? (
        // Teacher view
        <div className="space-y-2">
          {isMicEnabled ? (
            <Button
              onClick={onDisableMic}
              disabled={isLoading}
              className="w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Stopping...' : '🟴 Stop Microphone'}
            </Button>
          ) : (
            <Button
              onClick={onEnableMic}
              disabled={isLoading}
              className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Starting...' : '🟢 Start Microphone'}
            </Button>
          )}
          <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
            👨‍🏫 As a teacher, your microphone is always available
          </div>
        </div>
      ) : (
        // Student view
        <div className="space-y-2">
          {isMicEnabled ? (
            <Button
              onClick={onDisableMic}
              disabled={isLoading}
              className="w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Stopping...' : '🟴 Stop Microphone'}
            </Button>
          ) : hasMicPermission && !micRequested ? (
            <Button
              onClick={onEnableMic}
              disabled={isLoading}
              className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Starting...' : '🟢 Start Microphone'}
            </Button>
          ) : !hasMicPermission && !micRequested ? (
            <Button
              onClick={onRequestMic}
              disabled={isLoading}
              className="w-full bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {isLoading ? '⏳ Requesting...' : '🙋 Request Microphone'}
            </Button>
          ) : null}

          {micRequested && (
            <div className="text-xs text-gray-700 p-2 bg-yellow-50 border border-yellow-200 rounded">
              ⏳ Waiting for teacher approval... (Request sent)
            </div>
          )}

          {isMicEnabled && (
            <div className="text-xs text-gray-700 p-2 bg-green-50 border border-green-200 rounded">
              ✅ You are speaking. Everyone can hear you.
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>💡 Microphone is powered by WebRTC</p>
        <p className="mt-1">🔒 Your audio is encrypted and peer-to-peer</p>
      </div>
    </div>
  );
}
