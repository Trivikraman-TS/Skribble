import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';

export const ChatPanel = () => {
  const { roomState, currentPlayer, chatMessages, sendMessage } = useGame();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const isDrawer = roomState?.currentDrawerId === currentPlayer?.socketId && roomState?.gameState === 'DRAWING';
  const hasGuessed = currentPlayer?.hasGuessed && roomState?.gameState === 'DRAWING';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <div
      className="card-brutal"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--color-text)',
      }}
    >
      {/* PANEL TITLE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: 'var(--border-thin)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
        <MessageSquare size={18} style={{ color: 'var(--color-text)' }} />
        <span style={{ fontWeight: '900', fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--color-text)' }}>
          CHAT / GUESS
        </span>
      </div>

      {/* MESSAGES FEED */}
      <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {chatMessages.map((msg) => {
          if (msg.type === 'correct') {
            return (
              <div
                key={msg.id}
                style={{
                  backgroundColor: 'var(--neon-green)',
                  color: '#000000',
                  border: 'var(--border-thin)',
                  padding: '0.35rem 0.6rem',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                }}
              >
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'system') {
            return (
              <div
                key={msg.id}
                style={{
                  backgroundColor: 'var(--neon-cyan)',
                  color: '#000000',
                  border: 'var(--border-thin)',
                  padding: '0.35rem 0.6rem',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                }}
              >
                ℹ️ {msg.text}
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ fontSize: '0.88rem', wordBreak: 'break-word', color: 'var(--color-text)' }}>
              <span style={{ fontWeight: '800', color: msg.hasGuessed ? 'var(--neon-green)' : 'var(--color-text)' }}>
                {msg.sender}:
              </span>{' '}
              <span style={{ fontWeight: '500', color: 'var(--color-text)' }}>{msg.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          type="text"
          className="input-brutal"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem', backgroundColor: 'var(--bg-card)', color: 'var(--color-text)' }}
          placeholder={
            isDrawer
              ? "You are drawing..."
              : hasGuessed
              ? "You guessed correctly!"
              : "Type your guess here..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isDrawer || hasGuessed}
        />
        <button
          type="submit"
          className="btn-brutal btn-yellow btn-sm"
          disabled={isDrawer || hasGuessed || !text.trim()}
          style={{ padding: '0.5rem 0.8rem' }}
        >
          <Send size={16} />
        </button>
      </form>

      {/* DRAWER / GUESSED BANNER */}
      {isDrawer && (
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <AlertCircle size={14} /> Drawers cannot guess or type in chat.
        </div>
      )}
      {hasGuessed && !isDrawer && (
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          ✅ You guessed correctly! Wait for the round to finish.
        </div>
      )}

    </div>
  );
};
