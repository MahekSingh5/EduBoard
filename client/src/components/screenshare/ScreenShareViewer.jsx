import { useEffect, useRef, useState } from 'react';

export default function ScreenShareViewer({ remoteStream, isScreenActive, error, isTeacher, onFullscreen }) {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
      console.log('📺 Screen stream connected to video element');
    }
  }, [remoteStream]);

  const handleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          await videoRef.current.requestFullscreen();
        } else if (videoRef.current.webkitRequestFullscreen) {
          await videoRef.current.webkitRequestFullscreen();
        } else if (videoRef.current.mozRequestFullScreen) {
          await videoRef.current.mozRequestFullScreen();
        } else if (videoRef.current.msRequestFullscreen) {
          await videoRef.current.msRequestFullscreen();
        }
        setIsFullscreen(true);
        onFullscreen?.(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
        onFullscreen?.(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full bg-red-50 border-2 border-red-300 rounded-lg flex flex-col items-center justify-center p-6">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-bold text-red-700 mb-2">Screen Share Error</h3>
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (!isScreenActive) {
    return (
      <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6">
        <div className="text-5xl mb-4">🖥️</div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          {isTeacher ? 'Share Your Screen' : 'Waiting for Screen Share'}
        </h3>
        <p className="text-gray-600 text-center">
          {isTeacher
            ? 'Click the "Screen Share" button to start sharing your screen with the class'
            : 'The teacher will share their screen here'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />

      {/* Toolbar */}
      <div className="absolute top-0 right-0 flex gap-2 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleFullscreen}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-300 flex items-center gap-2"
          title="Toggle fullscreen"
        >
          {isFullscreen ? '↙️ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
      </div>

      {/* Status Badge */}
      <div className="absolute bottom-0 left-0 flex gap-2 p-4">
        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Screen Sharing Active
        </div>
      </div>

      {/* No remote stream warning */}
      {!remoteStream && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-3xl mb-2">⏳</div>
            <p>Connecting to screen share...</p>
          </div>
        </div>
      )}
    </div>
  );
}
