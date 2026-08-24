import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Clock, Copy, Check, LogOut, Sun, Moon } from 'lucide-react';

export const RoomHeader = () => {
  const { roomState, currentPlayer, timer, secretWord, hint, leaveRoom } = useGame();
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('skribble_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('skribble_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  if (!roomState) return null;

  const isDrawer = roomState.currentDrawerId === currentPlayer?.socketId;
  const isUrgent = timer.remainingTime <= 15 && timer.phase === 'DRAWING';

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="card-brutal" style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem', backgroundColor: 'var(--bg-card)', color: 'var(--color-text)', borderRadius: '0px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* ROOM CODE & ROUND */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              ROOM CODE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '900', fontSize: '1.15rem', color: 'var(--neon-pink)' }}>
                {roomState.roomCode}
              </span>
              <button
                type="button"
                className="btn-brutal btn-sm btn-cyan"
                style={{ padding: '0.15rem 0.4rem' }}
                onClick={copyRoomCode}
                title="Copy Room Code"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <div style={{ height: '24px', width: '2px', backgroundColor: 'var(--border-color)' }} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              ROUND
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '1.1rem', color: 'var(--color-text)' }}>
              {roomState.currentRound} / {roomState.totalRounds}
            </span>
          </div>
        </div>

        {/* SECRET WORD OR HINT DISPLAY */}
        <div
          className="card-brutal"
          style={{
            padding: '0.25rem 1rem',
            backgroundColor: isDrawer ? 'var(--neon-yellow)' : 'var(--bg-card)',
            color: isDrawer ? '#000000' : 'var(--color-text)',
            textAlign: 'center',
            minWidth: '200px',
          }}
        >
          <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', display: 'block', color: isDrawer ? '#000000' : 'var(--color-muted)' }}>
            {isDrawer ? '✏️ YOU ARE DRAWING:' : '🤔 WORD HINT:'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '900', fontSize: '1.25rem', letterSpacing: isDrawer ? '1px' : '3px', color: isDrawer ? '#000000' : 'var(--color-text)' }}>
            {isDrawer ? secretWord || 'CHOOSING...' : hint || '_ _ _ _ _'}
          </span>
        </div>

        {/* TIMER, THEME TOGGLE & LEAVE BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            className={`card-brutal ${isUrgent ? 'animate-pulse-slow' : ''}`}
            style={{
              padding: '0.3rem 0.8rem',
              backgroundColor: isUrgent ? 'var(--neon-pink)' : 'var(--neon-cyan)',
              color: isUrgent ? '#FFF' : '#000',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Clock size={16} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '900', fontSize: '1.15rem' }}>
              {timer.remainingTime}s
            </span>
          </div>

          <button
            type="button"
            className="btn-brutal btn-white btn-sm"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button type="button" className="btn-brutal btn-pink btn-sm" onClick={leaveRoom} title="Leave Room">
            <LogOut size={15} />
          </button>
        </div>

      </div>
    </header>
  );
};
