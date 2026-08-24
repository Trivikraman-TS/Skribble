import React, { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';

// Hex to RGBA helper
function hexToRgba(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [ (num >> 16) & 255, (num >> 8) & 255, num & 255, 255 ];
}

function colorMatch(data, idx, color, tolerance = 30) {
  return (
    Math.abs(data[idx] - color[0]) <= tolerance &&
    Math.abs(data[idx + 1] - color[1]) <= tolerance &&
    Math.abs(data[idx + 2] - color[2]) <= tolerance &&
    Math.abs(data[idx + 3] - color[3]) <= tolerance
  );
}

export const GameCanvas = ({ currentTool, strokeColor, strokeSize }) => {
  const { socket, roomState, currentPlayer } = useGame();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef([]);
  const strokesRef = useRef([]);

  const isDrawer = roomState?.currentDrawerId === currentPlayer?.socketId && roomState?.gameState === 'DRAWING';

  // Perform Flood Fill (Paint Bucket)
  const performFloodFill = useCallback((startX, startY, hexColor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const px = Math.floor(startX);
    const py = Math.floor(startY);

    if (px < 0 || px >= width || py < 0 || py >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const startIdx = (py * width + px) * 4;
    const targetColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
    const fillColor = hexToRgba(hexColor);

    if (
      Math.abs(targetColor[0] - fillColor[0]) < 5 &&
      Math.abs(targetColor[1] - fillColor[1]) < 5 &&
      Math.abs(targetColor[2] - fillColor[2]) < 5
    ) {
      return;
    }

    const queue = [[px, py]];
    const visited = new Uint8Array(width * height);

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const pos = y * width + x;

      if (visited[pos]) continue;
      visited[pos] = 1;

      const idx = pos * 4;
      if (colorMatch(data, idx, targetColor)) {
        data[idx] = fillColor[0];
        data[idx + 1] = fillColor[1];
        data[idx + 2] = fillColor[2];
        data[idx + 3] = 255;

        if (x > 0) queue.push([x - 1, y]);
        if (x < width - 1) queue.push([x + 1, y]);
        if (y > 0) queue.push([x, y - 1]);
        if (y < height - 1) queue.push([x, y + 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, []);

  // Draw stroke helper
  const drawStroke = (ctx, stroke) => {
    if (!stroke) return;

    if (stroke.type === 'fill' || stroke.tool === 'fill') {
      performFloodFill(stroke.point.x, stroke.point.y, stroke.color);
      return;
    }

    if (!stroke.points || stroke.points.length === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;

    if (stroke.tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
    } else {
      ctx.strokeStyle = stroke.color;
    }

    const pts = stroke.points;
    if (pts.length === 1) {
      ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
      ctx.fill();
    } else {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Redraw all accumulated strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokesRef.current.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });
  }, []);

  // Resize canvas
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();

    // Set internal canvas resolution directly to container bounds
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // SOCKET LISTENERS
  useEffect(() => {
    if (!socket) return;

    const handleRemoteStroke = (strokeData) => {
      strokesRef.current.push(strokeData);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        drawStroke(ctx, strokeData);
      }
    };

    const handleRemoteFill = (fillData) => {
      const strokeObj = { type: 'fill', tool: 'fill', point: fillData.point, color: fillData.color };
      strokesRef.current.push(strokeObj);
      performFloodFill(fillData.point.x, fillData.point.y, fillData.color);
    };

    const handleClearCanvas = () => {
      strokesRef.current = [];
      redrawCanvas();
    };

    const handleUndo = () => {
      strokesRef.current.pop();
      redrawCanvas();
    };

    const handleCanvasHistory = ({ strokes }) => {
      strokesRef.current = strokes || [];
      redrawCanvas();
    };

    socket.on('drawing_stroke', handleRemoteStroke);
    socket.on('drawing_fill', handleRemoteFill);
    socket.on('clear_canvas', handleClearCanvas);
    socket.on('undo', handleUndo);
    socket.on('canvas_history', handleCanvasHistory);

    return () => {
      socket.off('drawing_stroke', handleRemoteStroke);
      socket.off('drawing_fill', handleRemoteFill);
      socket.off('clear_canvas', handleClearCanvas);
      socket.off('undo', handleUndo);
      socket.off('canvas_history', handleCanvasHistory);
    };
  }, [socket, redrawCanvas, performFloodFill]);

  useEffect(() => {
    if (roomState?.gameState === 'CHOOSING_WORD' || roomState?.gameState === 'LOBBY') {
      strokesRef.current = [];
      redrawCanvas();
    }
  }, [roomState?.gameState, redrawCanvas]);

  // EXACT CANVAS POINTER ALIGNMENT
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e) => {
    if (!isDrawer) return;
    e.preventDefault();

    const point = getCanvasCoords(e);

    if (currentTool === 'fill') {
      performFloodFill(point.x, point.y, strokeColor);
      const fillObj = { type: 'fill', tool: 'fill', point, color: strokeColor };
      strokesRef.current.push(fillObj);
      if (socket) {
        socket.emit('drawing_fill', { point, color: strokeColor });
      }
      return;
    }

    isDrawingRef.current = true;
    currentPointsRef.current = [point];
  };

  const handlePointerMove = (e) => {
    if (!isDrawer || !isDrawingRef.current || currentTool === 'fill') return;
    e.preventDefault();

    const point = getCanvasCoords(e);
    currentPointsRef.current.push(point);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const tempStroke = {
        tool: currentTool,
        color: strokeColor,
        size: strokeSize,
        points: currentPointsRef.current,
      };
      drawStroke(ctx, tempStroke);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawer || !isDrawingRef.current || currentTool === 'fill') return;
    if (e) e.preventDefault();
    isDrawingRef.current = false;

    if (currentPointsRef.current.length > 0) {
      const finishedStroke = {
        tool: currentTool,
        color: strokeColor,
        size: strokeSize,
        points: [...currentPointsRef.current],
      };

      strokesRef.current.push(finishedStroke);
      if (socket) {
        socket.emit('drawing_stroke', finishedStroke);
      }
      currentPointsRef.current = [];
    }
  };

  return (
    <div
      ref={containerRef}
      className="card-brutal"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: '0',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        cursor: isDrawer ? (currentTool === 'eraser' ? 'cell' : currentTool === 'fill' ? 'copy' : 'crosshair') : 'not-allowed',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {!isDrawer && roomState?.gameState === 'DRAWING' && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'var(--neon-cyan)',
            color: '#000',
            padding: '0.3rem 0.6rem',
            border: 'var(--border-thin)',
            fontWeight: '800',
            fontSize: '0.75rem',
            pointerEvents: 'none',
          }}
        >
          👀 WATCHING {roomState.players.find(p => p.socketId === roomState.currentDrawerId)?.nickname || 'DRAWER'}
        </div>
      )}
    </div>
  );
};
