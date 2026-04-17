import { useState, useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export const useWhiteboard = (roomId) => {
  const { socket, emit, on, off } = useSocket();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('pen'); // 'pen' or 'eraser'
  const lastPointRef = useRef({ x: 0, y: 0 });

  const getCanvasCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    
    const { x, y } = getCanvasCoordinates(e);
    lastPointRef.current = { x, y };
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Emit the starting point so it syncs across users
    const stroke = {
      x,
      y,
      color: mode === 'pen' ? color : 'eraser',
      brushSize,
      mode,
      isStart: true,
    };
    emit(SOCKET_EVENTS.WHITEBOARD_DRAW, { roomId, stroke });
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const { x, y } = getCanvasCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    // Set drawing properties
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    
    // Use quadratic curve for smoother drawing
    const lastX = lastPointRef.current.x;
    const lastY = lastPointRef.current.y;
    const midX = (lastX + x) / 2;
    const midY = (lastY + y) / 2;
    
    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.stroke();
    
    lastPointRef.current = { x, y };

    const stroke = {
      x,
      y,
      color: mode === 'pen' ? color : 'eraser',
      brushSize,
      mode,
      lastX,
      lastY,
    };

    emit(SOCKET_EVENTS.WHITEBOARD_DRAW, { roomId, stroke });
  };

  const stopDrawing = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    emit(SOCKET_EVENTS.WHITEBOARD_CLEAR, { roomId });
  };

  useEffect(() => {
    on(SOCKET_EVENTS.WHITEBOARD_STROKE_RECEIVED, (data) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      
      const stroke = data.stroke;
      
      if (stroke.isStart) {
        ctx.beginPath();
        ctx.moveTo(stroke.x, stroke.y);
        return;
      }
      
      ctx.lineWidth = stroke.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (stroke.mode === 'eraser' || stroke.color === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }
      
      if (stroke.lastX !== undefined && stroke.lastY !== undefined) {
        const midX = (stroke.lastX + stroke.x) / 2;
        const midY = (stroke.lastY + stroke.y) / 2;
        ctx.quadraticCurveTo(stroke.lastX, stroke.lastY, midX, midY);
      } else {
        ctx.lineTo(stroke.x, stroke.y);
      }
      ctx.stroke();
    });

    on(SOCKET_EVENTS.WHITEBOARD_CLEARED, () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    return () => {
      off(SOCKET_EVENTS.WHITEBOARD_STROKE_RECEIVED);
      off(SOCKET_EVENTS.WHITEBOARD_CLEARED);
    };
  }, [on, off]);

  return {
    canvasRef,
    isDrawing,
    color,
    setColor,
    brushSize,
    setBrushSize,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    history,
    mode,
    setMode,
  };
};
