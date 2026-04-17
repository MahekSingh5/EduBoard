import { useState, useRef, useEffect } from 'react';
import VideoDisplay from './VideoDisplay';

export default function ResizableCameraWindow({ stream, userName, roomId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [size, setSize] = useState({ width: 320, height: 240 });
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e) => {
    if (e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        handleDragMove(e);
      } else if (isResizing) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        setSize({
          width: Math.max(200, dragStartRef.current.width + deltaX),
          height: Math.max(150, dragStartRef.current.height + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  if (isExpanded) {
    return (
      <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
        <div className="relative w-full h-full">
          <VideoDisplay stream={stream} userName={userName} isMuted={true} />
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
          >
            Exit Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed bg-gray-900 rounded-lg shadow-xl border-2 border-purple-400 cursor-move ${
        isDragging ? 'opacity-75' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: isDragging ? 1000 : 100,
      }}
      onMouseDown={handleDragStart}
    >
      {/* Camera Feed */}
      <div className="w-full h-full rounded-lg overflow-hidden bg-black relative group">
        <VideoDisplay stream={stream} userName={userName} isMuted={true} />

        {/* Toolbar - visible on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
          <div className="flex justify-between items-center text-white text-xs">
            <span className="font-semibold">{userName}</span>
            <span className="bg-red-500 px-2 py-1 rounded">LIVE</span>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setIsExpanded(true)}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              title="Fullscreen"
            >
              ⛶ Expand
            </button>
          </div>
        </div>

        {/* Drag Handle (header) */}
        <div
          className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-purple-500 to-purple-600 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        />

        {/* Resize Handle (bottom-right) */}
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-purple-400 cursor-se-resize hover:bg-purple-500"
          onMouseDown={handleResizeStart}
          title="Drag to resize"
        />
      </div>
    </div>
  );
}
