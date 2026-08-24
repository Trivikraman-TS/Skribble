import React from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles, Clock } from 'lucide-react';

export const WordChooser = () => {
  const { roomState, currentPlayer, wordChoices, chooseWord, timer } = useGame();

  const isDrawer = roomState?.currentDrawerId === currentPlayer?.socketId;
  const isChoosing = roomState?.gameState === 'CHOOSING_WORD';

  if (!isChoosing) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}
    >
      <div
        className="card-brutal card-brutal-lg animate-pop"
        style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--color-text)',
          textAlign: 'center',
        }}
      >
        {isDrawer ? (
          <>
            <div className="badge-brutal" style={{ backgroundColor: 'var(--neon-yellow)', color: '#000', marginBottom: '0.8rem' }}>
              <Sparkles size={14} inline /> YOUR TURN TO DRAW!
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
              CHOOSE A WORD
            </h2>

            <p style={{ fontWeight: '600', color: 'var(--color-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Select one word below before time runs out:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {wordChoices.map((word, idx) => (
                <button
                  key={word}
                  type="button"
                  className={`btn-brutal btn-lg ${idx === 0 ? 'btn-yellow' : idx === 1 ? 'btn-cyan' : 'btn-green'}`}
                  onClick={() => chooseWord(word)}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                >
                  {word}
                </button>
              ))}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: '900', fontSize: '1.2rem', color: 'var(--neon-pink)' }}>
              <Clock size={20} /> {timer.remainingTime}s REMAINING
            </div>
          </>
        ) : (
          <>
            <div className="badge-brutal" style={{ backgroundColor: 'var(--neon-cyan)', color: '#000', marginBottom: '0.8rem' }}>
              WAITING FOR DRAWER
            </div>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
              {roomState.players.find(p => p.socketId === roomState.currentDrawerId)?.nickname || 'DRAWER'} IS CHOOSING A WORD...
            </h2>

            <div style={{ marginTop: '1.5rem', fontFamily: 'var(--font-mono)', fontWeight: '900', fontSize: '1.2rem', color: 'var(--color-text)' }}>
              ⏳ {timer.remainingTime}s
            </div>
          </>
        )}
      </div>
    </div>
  );
};
