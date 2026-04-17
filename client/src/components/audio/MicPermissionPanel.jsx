import Button from '../common/Button';

export default function MicPermissionPanel({ roomId, students = [] }) {
  // Students with raised hands (mic requests)
  const requestedStudents = students.filter((s) => s.micRequested);

  if (requestedStudents.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">🎤 Microphone Requests</h3>
        <div className="text-center py-6 bg-gray-50 rounded">
          <p className="text-gray-500 text-sm">No pending microphone requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">
        🎤 Microphone Requests
        <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
          {requestedStudents.length}
        </span>
      </h3>

      <div className="space-y-2">
        {requestedStudents.map((student) => (
          <div
            key={student.id}
            className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{student.username}</p>
              <p className="text-xs text-gray-500">Requested microphone access</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => console.log('Approve:', student.id)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                size="sm"
                onClick={() => console.log('Reject:', student.id)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
