import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RoomHeader } from '../components/RoomHeader';
import { GameCanvas } from '../components/GameCanvas';
import { DrawingToolbar } from '../components/DrawingToolbar';
import { PlayerList } from '../components/PlayerList';
import { ChatPanel } from '../components/ChatPanel';
import { WordChooser } from '../components/WordChooser';
import { RoundResult } from '../components/RoundResult';
import { GameResult } from '../components/GameResult';

export const GamePage = () => {
  const { roomState } = useGame();

  const [currentTool, setCurrentTool] = useState('pencil');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeSize, setStrokeSize] = useState(6);

  if (!roomState) return null;

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* ROOM HEADER AT TOP */}
      <RoomHeader />

      {/* NO-SCROLL DASHBOARD GRID */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '220px 1fr 280px',
          gap: '0.6rem',
          overflow: 'hidden',
        }}
        className="game-dashboard-grid"
      >
        {/* LEFT COLUMN: PLAYER SCOREBOARD */}
        <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <PlayerList />
        </div>

        {/* CENTER COLUMN: CANVAS & TOOLBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
            <GameCanvas
              currentTool={currentTool}
              strokeColor={strokeColor}
              strokeSize={strokeSize}
            />
          </div>
          <DrawingToolbar
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            strokeColor={strokeColor}
            setStrokeColor={setStrokeColor}
            strokeSize={strokeSize}
            setStrokeSize={setStrokeSize}
          />
        </div>

        {/* RIGHT COLUMN: CHAT & GUESSES */}
        <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          <ChatPanel />
        </div>
      </div>

      {/* OVERLAY MODALS */}
      <WordChooser />
      <RoundResult />
      <GameResult />

      {/* MOBILE RESPONSIVE OVERRIDE */}
      <style>{`
        @media (max-width: 900px) {
          body, html, #root {
            overflow: auto !important;
            height: auto !important;
            max-height: none !important;
          }
          .game-dashboard-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
};
