import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import { RotateCcw, LogOut, Crown } from 'lucide-react';

export const GameResult = () => {
  const { roomState, gameEndData, currentPlayer, startGame, leaveRoom } = useGame();

  const isGameEnd = roomState?.gameState === 'GAME_END' || !!gameEndData;

  useEffect(() => {
    if (isGameEnd) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore fallback
      }
    }
  }, [isGameEnd]);

  if (!isGameEnd) return null;

  const standings = gameEndData?.standings || roomState?.players?.sort((a, b) => b.score - a.score) || [];
  const first = standings[0];
  const second = standings[1];
  const third = standings[2];

  const isHost = currentPlayer?.isHost;

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
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--color-text)',
          textAlign: 'center',
        }}
      >
        <span className="badge-brutal" style={{ backgroundColor: 'var(--neon-pink)', color: '#FFF', marginBottom: '0.5rem' }}>
          GAME COMPLETED!
        </span>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>
          VICTORY PODIUM
        </h1>

        {/* PODIUM DISPLAY */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem', height: '180px' }}>
          
          {/* 2ND PLACE */}
          {second && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.3rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', color: 'var(--color-text)' }}>
                {second.nickname}
              </div>
              <div
                className="card-brutal"
                style={{
                  width: '100%',
                  height: '110px',
                  backgroundColor: 'var(--neon-cyan)',
                  color: '#000',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>🥈 2ND</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '800' }}>
                  {second.score} PTS
                </span>
              </div>
            </div>
          )}

          {/* 1ST PLACE */}
          {first && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
              <Crown size={28} style={{ color: 'var(--neon-orange)', marginBottom: '0.2rem' }} />
              <div style={{ fontWeight: '900', fontSize: '1rem', marginBottom: '0.3rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', color: 'var(--color-text)' }}>
                {first.nickname}
              </div>
              <div
                className="card-brutal"
                style={{
                  width: '100%',
                  height: '140px',
                  backgroundColor: 'var(--neon-yellow)',
                  color: '#000',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.8rem', fontWeight: '900' }}>🏆 1ST</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '900' }}>
                  {first.score} PTS
                </span>
              </div>
            </div>
          )}

          {/* 3RD PLACE */}
          {third && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.3rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', color: 'var(--color-text)' }}>
                {third.nickname}
              </div>
              <div
                className="card-brutal"
                style={{
                  width: '100%',
                  height: '90px',
                  backgroundColor: 'var(--neon-pink)',
                  color: '#FFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.3rem', fontWeight: '900' }}>🥉 3RD</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '800' }}>
                  {third.score} PTS
                </span>
              </div>
            </div>
          )}

        </div>

        {/* BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {isHost && (
            <button type="button" className="btn-brutal btn-yellow btn-lg" onClick={startGame}>
              <RotateCcw size={20} /> PLAY AGAIN
            </button>
          )}
          <button type="button" className="btn-brutal btn-pink btn-lg" onClick={leaveRoom}>
            <LogOut size={20} /> LEAVE LOBBY
          </button>
        </div>

      </div>
    </div>
  );
};
