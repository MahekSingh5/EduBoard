import { useEffect, useRef } from 'react';

export default function VideoDisplay({ stream, userName, isMuted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📹</div>
          <p className="text-gray-400 text-sm">Camera off</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      {userName && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-xs font-medium">
          {userName}
        </div>
      )}
    </div>
  );
}
