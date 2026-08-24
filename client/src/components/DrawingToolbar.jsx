import React from 'react';
import { useGame } from '../context/GameContext';
import { Pencil, PaintBucket, Eraser, RotateCcw, Trash2 } from 'lucide-react';

const COLORS = [
  '#000000', '#FFFFFF', '#FF0055', '#00FF66',
  '#00E5FF', '#FFE600', '#FF5C00', '#B537FF',
  '#8B4513', '#777777'
];

const SIZES = [
  { label: 'S', size: 3 },
  { label: 'M', size: 6 },
  { label: 'L', size: 12 },
  { label: 'XL', size: 24 },
];

export const DrawingToolbar = ({ currentTool, setCurrentTool, strokeColor, setStrokeColor, strokeSize, setStrokeSize }) => {
  const { socket, roomState, currentPlayer } = useGame();

  const isDrawer = roomState?.currentDrawerId === currentPlayer?.socketId && roomState?.gameState === 'DRAWING';

  if (!isDrawer) return null;

  const handleClear = () => {
    if (socket) socket.emit('clear_canvas');
  };

  const handleUndo = () => {
    if (socket) socket.emit('undo');
  };

  return (
    <div
      className="card-brutal"
      style={{
        padding: '0.4rem 0.75rem',
        marginTop: '0.5rem',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6rem',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* DRAWING TOOLS */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        <button
          type="button"
          className={`btn-brutal btn-sm ${currentTool === 'pencil' ? 'btn-yellow' : 'btn-white'}`}
          onClick={() => setCurrentTool('pencil')}
          title="Pencil Tool"
        >
          <Pencil size={15} /> PENCIL
        </button>
        <button
          type="button"
          className={`btn-brutal btn-sm ${currentTool === 'fill' ? 'btn-cyan' : 'btn-white'}`}
          onClick={() => setCurrentTool('fill')}
          title="Paint Bucket (Flood Fill)"
        >
          <PaintBucket size={15} /> FILL
        </button>
        <button
          type="button"
          className={`btn-brutal btn-sm ${currentTool === 'eraser' ? 'btn-pink' : 'btn-white'}`}
          onClick={() => setCurrentTool('eraser')}
          title="Eraser Tool"
        >
          <Eraser size={15} /> ERASER
        </button>
      </div>

      {/* BRUSH SIZES */}
      {currentTool !== 'fill' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span style={{ fontWeight: '800', fontSize: '0.7rem', marginRight: '0.2rem' }}>SIZE:</span>
          {SIZES.map(({ label, size }) => (
            <button
              key={size}
              type="button"
              className={`btn-brutal btn-sm ${strokeSize === size ? 'btn-cyan' : 'btn-white'}`}
              style={{ padding: '0.15rem 0.4rem', minWidth: '28px', fontSize: '0.75rem' }}
              onClick={() => setStrokeSize(size)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* COLOR PALETTE */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              setStrokeColor(color);
              if (currentTool === 'eraser') setCurrentTool('pencil');
            }}
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: color,
              border: strokeColor === color && currentTool !== 'eraser' ? '3px solid var(--neon-yellow)' : '1px solid #000',
              boxShadow: strokeColor === color && currentTool !== 'eraser' ? '2px 2px 0 #000' : 'none',
              transform: strokeColor === color && currentTool !== 'eraser' ? 'scale(1.15)' : 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* UNDO & CLEAR */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        <button type="button" className="btn-brutal btn-sm btn-cyan" onClick={handleUndo} title="Undo stroke">
          <RotateCcw size={14} /> UNDO
        </button>
        <button type="button" className="btn-brutal btn-sm btn-pink" onClick={handleClear} title="Clear canvas">
          <Trash2 size={14} /> CLEAR
        </button>
      </div>
    </div>
  );
};
