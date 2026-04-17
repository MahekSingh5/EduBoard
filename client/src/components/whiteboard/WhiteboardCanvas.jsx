import { useRef, useEffect, useState } from 'react';
import { useWhiteboard } from '../../hooks/useWhiteboard';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useTheme } from '../../hooks/useTheme';

export default function WhiteboardCanvas({ roomId }) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    mode,
    setMode,
  } = useWhiteboard(roomId);

  const userId = user?._id || user?.id;
  const { canDraw, requestDrawingPermission, drawingRequestStatus } = usePermissions(roomId, userId, user?.role);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const isDrawingDisabled = user?.role === 'student' && !canDraw();

  const handleDrawingAttempt = (e) => {
    if (isDrawingDisabled) {
      return;
    }
    startDrawing(e);
  };

  const handleDraw = (e) => {
    if (isDrawingDisabled) return;
    draw(e);
  };

  const handleStopDrawing = () => {
    if (isDrawingDisabled) return;
    stopDrawing();
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height - 100 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const brushColors = ['#000000', '#FF0000', '#00AA00', '#0000FF', '#FFAA00', '#FF00FF', '#00AAAA'];

  return (
    <div className={`flex flex-col h-full rounded-2xl border shadow-lg overflow-hidden ${
      isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 flex items-center gap-3 border-b border-purple-700/20">
        <div className="text-2xl">🎨</div>
        <div>
          <h2 className="text-lg font-bold">Interactive Whiteboard</h2>
          <p className="text-purple-100 text-sm">
            {isDrawingDisabled ? 'View the teacher board live' : 'Collaborate in real-time'}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`border-b px-4 py-3 flex flex-wrap items-center gap-4 ${
        isDarkMode
          ? 'bg-gray-700 border-gray-600'
          : 'bg-white border-gray-200'
      }`}>
        {/* Tool Selection */}
        <div className={`flex items-center gap-2 border-r pr-4 ${
          isDarkMode ? 'border-gray-600' : 'border-gray-300'
        }`}>
          <button
            onClick={() => setMode('pen')}
            disabled={isDrawingDisabled}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'pen'
                ? 'bg-blue-500 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setMode('eraser')}
            disabled={isDrawingDisabled}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'eraser'
                ? 'bg-red-500 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-eraser"></i> Eraser
          </button>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-3">
          <label className={`text-sm font-semibold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Size:
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            disabled={isDrawingDisabled}
            className="w-24 h-2 bg-gradient-to-r from-gray-300 to-gray-500 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #667eea 0%, #667eea ${(brushSize / 30) * 100}%, #e5e7eb ${(brushSize / 30) * 100}%, #e5e7eb 100%)`,
            }}
          />
          <span className={`text-sm font-bold px-2 py-1 rounded ${
            isDarkMode
              ? 'text-gray-300 bg-gray-600'
              : 'text-gray-700 bg-gray-100'
          }`}>
            {brushSize}px
          </span>
        </div>

        {/* Color Picker (only show for pen mode) */}
        {mode === 'pen' && (
          <div className="flex items-center gap-2">
            <label className={`text-sm font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Color:
            </label>
            <div className="flex gap-1">
              {brushColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  disabled={isDrawingDisabled}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                    color === c ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isDrawingDisabled}
                className="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
                title="Custom color"
              />
            </div>
          </div>
        )}

        {/* Clear Button */}
        <button
          onClick={() => {
            if (window.confirm('Clear the entire whiteboard? This cannot be undone.')) {
              clearCanvas();
            }
          }}
          disabled={isDrawingDisabled}
          className={`ml-auto px-4 py-2 rounded-lg font-semibold transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border-red-700'
              : 'bg-red-500/20 hover:bg-red-500/30 text-red-600 border-red-300'
          }`}
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-black relative overflow-hidden">
        {isDrawingDisabled && (
          <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
            <button
              onClick={requestDrawingPermission}
              disabled={drawingRequestStatus === 'pending'}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg shadow-lg transition-colors"
            >
              {drawingRequestStatus === 'pending' ? 'Request sent' : 'Ask to draw'}
            </button>
            {drawingRequestStatus === 'rejected' && (
              <p className="rounded bg-white/95 px-2 py-1 text-xs font-medium text-red-600 shadow">
                Teacher declined
              </p>
            )}
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleDrawingAttempt}
          onMouseMove={handleDraw}
          onMouseUp={handleStopDrawing}
          onMouseLeave={handleStopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
              clientX: touch.clientX,
              clientY: touch.clientY,
            });
            canvasRef.current?.dispatchEvent(mouseEvent);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
              clientX: touch.clientX,
              clientY: touch.clientY,
            });
            canvasRef.current?.dispatchEvent(mouseEvent);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvasRef.current?.dispatchEvent(mouseEvent);
          }}
          className="w-full h-full cursor-crosshair bg-white block touch-none"
          style={{ cursor: isDrawingDisabled ? 'default' : 'crosshair' }}
        />
      </div>

      {/* Status Bar */}
      <div className={`border-t px-4 py-2 flex items-center justify-between text-xs ${
        isDarkMode
          ? 'bg-gray-700 border-gray-600 text-gray-300'
          : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <div>
          {mode === 'pen' ? (
            <>
              Brush: <span className="font-bold" style={{ color }}>{color}</span> ({brushSize}px)
            </>
          ) : (
            <>
              Eraser ({brushSize}px) - Click to erase
            </>
          )}
        </div>
        <div>{isDrawingDisabled ? 'Watching only' : 'Draw smoothly and naturally'}</div>
      </div>
    </div>
  );
}
