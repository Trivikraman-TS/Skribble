import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Copy, Check, Play, Crown, Users, Settings, LogOut } from 'lucide-react';

export const LobbyPage = () => {
  const { roomState, currentPlayer, startGame, updateSettings, leaveRoom } = useGame();
  const [copied, setCopied] = useState(false);

  if (!roomState) return null;

  const isHost = currentPlayer?.isHost;
  const players = roomState.players || [];

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card-brutal card-brutal-lg animate-pop" style={{ maxWidth: '800px', width: '100%', backgroundColor: 'var(--bg-card)', color: 'var(--color-text)' }}>
        
        {/* LOBBY HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: 'var(--border-thick)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge-brutal" style={{ backgroundColor: 'var(--neon-green)', color: '#000', marginBottom: '0.3rem' }}>
              ROOM LOBBY
            </span>
            <h2 style={{ fontSize: '2rem', color: 'var(--color-text)' }}>
              CODE: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-pink)' }}>{roomState.roomCode}</span>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-brutal btn-cyan" onClick={copyRoomCode}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'COPIED!' : 'COPY CODE'}
            </button>
            <button type="button" className="btn-brutal btn-pink btn-sm" onClick={leaveRoom} title="Leave Room">
              <LogOut size={18} /> LEAVE
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          
          {/* PLAYER LIST */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Users size={22} style={{ color: 'var(--color-text)' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text)' }}>
                PLAYERS ({players.length} / 12)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
              {players.map((p) => (
                <div
                  key={p.socketId}
                  className="card-brutal"
                  style={{
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: p.socketId === currentPlayer?.socketId ? 'var(--card-subtle-bg)' : 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: p.avatarColor || '#FFE600',
                      border: '2px solid #000',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ overflow: 'hidden', width: '100%' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>
                      {p.nickname} {p.socketId === currentPlayer?.socketId && '(YOU)'}
                    </div>
                    {p.isHost && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--neon-orange)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Crown size={12} /> ROOM HOST
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROOM SETTINGS & START BUTTON */}
          <div style={{ borderLeft: 'var(--border-thick)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Settings size={20} style={{ color: 'var(--color-text)' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>SETTINGS</h3>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--color-text)' }}>
                  TOTAL ROUNDS
                </label>
                <select
                  className="input-brutal"
                  value={roomState.totalRounds}
                  disabled={!isHost}
                  onChange={(e) => updateSettings(Number(e.target.value), roomState.roundDuration)}
                >
                  <option value={2}>2 Rounds</option>
                  <option value={3}>3 Rounds</option>
                  <option value={5}>5 Rounds</option>
                  <option value={8}>8 Rounds</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--color-text)' }}>
                  DRAWING TIME
                </label>
                <select
                  className="input-brutal"
                  value={roomState.roundDuration}
                  disabled={!isHost}
                  onChange={(e) => updateSettings(roomState.totalRounds, Number(e.target.value))}
                >
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                  <option value={80}>80 Seconds</option>
                  <option value={120}>120 Seconds</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              {isHost ? (
                <button
                  type="button"
                  className="btn-brutal btn-yellow w-full btn-lg"
                  onClick={startGame}
                  disabled={players.length < 2}
                >
                  <Play size={24} /> {players.length < 2 ? 'NEED 2+ PLAYERS' : 'START GAME'}
                </button>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-cream)', border: 'var(--border-thick)', fontWeight: '800', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  ⏳ WAITING FOR HOST TO START...
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
