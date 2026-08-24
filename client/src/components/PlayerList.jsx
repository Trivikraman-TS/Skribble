import React from 'react';
import { useGame } from '../context/GameContext';
import { Pencil, CheckCircle2, Crown } from 'lucide-react';

export const PlayerCard = ({ player, rank, isCurrentDrawer }) => {
  const { currentPlayer } = useGame();
  const isMe = player.socketId === currentPlayer?.socketId;

  return (
    <div
      className="card-brutal"
      style={{
        padding: '0.6rem 0.8rem',
        marginBottom: '0.5rem',
        backgroundColor: isMe
          ? 'var(--card-subtle-bg)'
          : (player.hasGuessed ? 'var(--card-subtle-bg)' : 'var(--bg-card)'),
        color: 'var(--color-text)',
        borderColor: 'var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
        {/* RANK BADGE */}
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '900', fontSize: '0.9rem', width: '20px', color: 'var(--color-text)' }}>
          #{rank}
        </span>

        {/* AVATAR COLOR */}
        <div
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: player.avatarColor || '#FFE600',
            border: '2px solid #000',
            flexShrink: 0,
          }}
        />

        {/* NICKNAME & SCORE */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: '800', fontSize: '0.9rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-text)' }}>
            {player.nickname} {isMe && '(YOU)'}
            {player.isHost && <Crown size={12} style={{ color: 'var(--neon-orange)' }} />}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            {player.score} PTS
          </div>
        </div>
      </div>

      {/* STATUS INDICATORS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {isCurrentDrawer && (
          <span className="badge-brutal" style={{ backgroundColor: 'var(--neon-yellow)', color: '#000', padding: '0.15rem 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Pencil size={12} /> DRAWING
          </span>
        )}
        {player.hasGuessed && !isCurrentDrawer && (
          <span className="badge-brutal" style={{ backgroundColor: 'var(--neon-green)', color: '#000', padding: '0.15rem 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <CheckCircle2 size={12} /> GUESSED
          </span>
        )}
      </div>
    </div>
  );
};

export const PlayerList = () => {
  const { roomState } = useGame();

  if (!roomState) return null;

  const players = [...(roomState.players || [])].sort((a, b) => b.score - a.score);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontWeight: '900', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '0.95rem', textTransform: 'uppercase', color: 'var(--color-text)' }}>
        SCOREBOARD ({players.length})
      </div>
      <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.2rem' }}>
        {players.map((p, idx) => (
          <PlayerCard
            key={p.socketId}
            player={p}
            rank={idx + 1}
            isCurrentDrawer={p.socketId === roomState.currentDrawerId}
          />
        ))}
      </div>
    </div>
  );
};
