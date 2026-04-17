import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function VideoControls({
  isCameraEnabled,
  hasCameraPermission,
  cameraRequested,
  isLoading,
  onEnableCamera,
  onDisableCamera,
  onRequestCamera,
  error,
}) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          📹 Camera
          {isCameraEnabled && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
        </h3>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {isTeacher ? (
        <div className="space-y-2">
          {isCameraEnabled ? (
            <Button
              onClick={onDisableCamera}
              disabled={isLoading}
              className="w-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 rounded-lg py-2 font-medium"
            >
              {isLoading ? '⏳ Stopping...' : '🟴 Stop Camera'}
            </Button>
          ) : (
            <Button
              onClick={onEnableCamera}
              disabled={isLoading}
              className="w-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 rounded-lg py-2 font-medium"
            >
              {isLoading ? '⏳ Starting...' : '🟢 Start Camera'}
            </Button>
          )}
          <div className="text-xs text-purple-700 p-2 bg-purple-50 rounded">
            👨‍🏫 Your camera is always available
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {isCameraEnabled ? (
            <Button
              onClick={onDisableCamera}
              disabled={isLoading}
              className="w-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 rounded-lg py-2 font-medium"
            >
              {isLoading ? '⏳ Stopping...' : '🟴 Stop Camera'}
            </Button>
          ) : hasCameraPermission && !cameraRequested ? (
            <Button
              onClick={onEnableCamera}
              disabled={isLoading}
              className="w-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 rounded-lg py-2 font-medium"
            >
              {isLoading ? '⏳ Starting...' : '🟢 Start Camera'}
            </Button>
          ) : !hasCameraPermission && !cameraRequested ? (
            <Button
              onClick={onRequestCamera}
              disabled={isLoading}
              className="w-full bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 rounded-lg py-2 font-medium"
            >
              {isLoading ? '⏳ Requesting...' : '🙋 Request Camera'}
            </Button>
          ) : null}

          {cameraRequested && (
            <div className="text-xs text-yellow-700 p-2 bg-yellow-50 border border-yellow-200 rounded">
              ⏳ Waiting for teacher approval...
            </div>
          )}

          {isCameraEnabled && (
            <div className="text-xs text-green-700 p-2 bg-green-50 border border-green-200 rounded">
              ✅ Your camera is on. Everyone can see you.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
