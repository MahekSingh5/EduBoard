import { useTheme } from '../../hooks/useTheme';

export default function PermissionsPanel({
  pendingRequests,
  onGrantDrawing,
  onRevokeDrawing,
  onGrantScreenShare,
  onRevokeScreenShare,
  drawingPermissions,
  screenSharePermissions,
}) {
  const { isDarkMode } = useTheme();

  const students = Object.entries(pendingRequests).map(([id, requests]) => ({
    id,
    ...requests,
  }));

  if (students.length === 0) {
    return (
      <div className={`rounded-lg p-4 text-center text-sm ${
        isDarkMode
          ? 'bg-gray-800 text-gray-400 border border-gray-700'
          : 'bg-gray-50 text-gray-500 border border-gray-200'
      }`}>
        <p>No permission requests</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border ${
      isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 font-bold border-b ${
        isDarkMode
          ? 'bg-gray-700 border-gray-600 text-white'
          : 'bg-gray-100 border-gray-200 text-gray-800'
      }`}>
        🔐 Permission Requests
      </div>

      <div className="max-h-96 overflow-y-auto">
        {students.map((student) => (
          <div
            key={student.id}
            className={`p-4 border-b ${
              isDarkMode
                ? 'border-gray-700 hover:bg-gray-700/50'
                : 'border-gray-100 hover:bg-gray-50'
            }`}
          >
            <p className={`font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {student.drawing || student.screenShare || 'Student'}
            </p>

            {student.drawing && (
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => onGrantDrawing(student.id, student.drawing)}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors"
                >
                  ✅ Allow Drawing
                </button>
                <button
                  onClick={() => onRevokeDrawing(student.id)}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded transition-colors ${
                    drawingPermissions[student.id]
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  {drawingPermissions[student.id] ? '⛔ Revoke' : '✖ Deny'}
                </button>
              </div>
            )}

            {student.screenShare && (
              <div className="flex gap-2">
                <button
                  onClick={() => onGrantScreenShare(student.id, student.screenShare)}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors"
                >
                  ✅ Allow Screen Share
                </button>
                <button
                  onClick={() => onRevokeScreenShare(student.id)}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded transition-colors ${
                    screenSharePermissions[student.id]
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  {screenSharePermissions[student.id] ? '⛔ Revoke' : '✖ Deny'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
