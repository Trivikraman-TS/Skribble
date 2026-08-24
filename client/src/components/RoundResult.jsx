import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy } from 'lucide-react';

export const RoundResult = () => {
  const { roomState, roundEndData } = useGame();

  if (roomState?.gameState !== 'ROUND_END' || !roundEndData) return null;

  const sortedScores = (roundEndData.scores || []).sort((a, b) => b.score - a.score);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
          maxWidth: '550px',
          width: '100%',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--color-text)',
          textAlign: 'center',
        }}
      >
        <span className="badge-brutal" style={{ backgroundColor: 'var(--neon-green)', color: '#000', marginBottom: '0.5rem' }}>
          ROUND ENDED
        </span>

        <h3 style={{ color: 'var(--color-muted)', fontSize: '1rem', fontWeight: '800', marginBottom: '0.3rem' }}>
          {roundEndData.reason || 'Round Complete'}
        </h3>

        <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: 'var(--neon-yellow)', border: 'var(--border-thick)', color: '#000' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
            THE SECRET WORD WAS:
          </span>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', letterSpacing: '2px', color: '#000' }}>
            {roundEndData.secretWord}
          </h2>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '900', fontFamily: 'var(--font-display)', marginBottom: '0.75rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text)' }}>
            <Trophy size={18} /> LEADERBOARD STANDINGS
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: 'var(--border-thick)', backgroundColor: 'var(--bg-cream)' }}>
            {sortedScores.map((p, idx) => (
              <div
                key={p.socketId}
                style={{
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx === sortedScores.length - 1 ? 'none' : 'var(--border-thin)',
                  backgroundColor: p.roundPoints > 0 ? 'var(--card-subtle-bg)' : 'var(--bg-card)',
                  color: 'var(--color-text)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '900', fontFamily: 'var(--font-mono)' }}>#{idx + 1}</span>
                  <span style={{ fontWeight: '800' }}>{p.nickname}</span>
                  {p.roundPoints > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--neon-green)', backgroundColor: '#000', padding: '0.1rem 0.4rem' }}>
                      +{p.roundPoints} PTS
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '900' }}>
                  {p.score} PTS
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
          NEXT ROUND STARTING SHORTLY...
        </p>
      </div>
    </div>
  );
};
