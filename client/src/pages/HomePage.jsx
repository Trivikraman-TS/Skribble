import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { LogIn, PlusCircle, Play, Sparkles, Sun, Moon } from 'lucide-react';

const AVATAR_COLORS = [
  '#FFE600', // Yellow
  '#00FF66', // Green
  '#FF0055', // Pink
  '#00E5FF', // Cyan
  '#FF5C00', // Orange
  '#B537FF', // Purple
  '#000000', // Black
  '#FFFFFF', // White
];

export const HomePage = () => {
  const { createRoom, joinRoom, errorMessage, isConnected } = useGame();
  
  const [nickname, setNickname] = useState('');
  const [avatarColor, setAvatarColor] = useState('#FFE600');
  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  
  const [totalRounds, setTotalRounds] = useState(3);
  const [roundDuration, setRoundDuration] = useState(80);
  const [isLoading, setIsLoading] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem('skribble_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('skribble_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setIsLoading(true);
    createRoom(nickname, avatarColor, (res) => {
      setIsLoading(false);
      if (!res.success && res.error) {
        alert(res.error);
      }
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !roomCode.trim()) return;
    setIsLoading(true);
    joinRoom(roomCode, nickname, avatarColor, (res) => {
      setIsLoading(false);
      if (!res.success && res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      
      {/* THEME TOGGLE BUTTON AT TOP RIGHT */}
      <button
        type="button"
        className="btn-brutal btn-white btn-sm"
        onClick={toggleTheme}
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
      </button>

      <div className="card-brutal card-brutal-lg animate-pop" style={{ maxWidth: '500px', width: '100%', backgroundColor: 'var(--bg-card)' }}>
        
        {/* HEADER BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
          <div className="badge-brutal" style={{ backgroundColor: 'var(--neon-pink)', color: '#FFF', transform: 'rotate(-2deg)', marginBottom: '0.5rem' }}>
            MULTIPLAYER DRAWING GAME
          </div>
          <h1 style={{ fontSize: '2.8rem', letterSpacing: '-1px', lineHeight: '1' }}>
            SKRIBBLE
          </h1>
          <p style={{ fontWeight: '600', opacity: 0.8, marginTop: '0.5rem', fontSize: '0.9rem' }}>
            DRAW FAST. GUESS FASTER. NO MERCY.
          </p>
        </div>

        {/* CONNECTION STATUS BANNER */}
        {!isConnected && (
          <div style={{ padding: '0.5rem 1rem', background: 'var(--neon-pink)', color: '#FFF', border: 'var(--border-thick)', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
            ⚠️ CONNECTING TO SERVER...
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div style={{ padding: '0.5rem 1rem', background: 'var(--neon-orange)', color: '#FFF', border: 'var(--border-thick)', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
            🚫 {errorMessage}
          </div>
        )}

        {/* NICKNAME & AVATAR SELECTION */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', border: 'var(--border-thick)', backgroundColor: 'var(--bg-cream)' }}>
          <label style={{ display: 'block', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            YOUR NICKNAME
          </label>
          <input
            type="text"
            className="input-brutal"
            placeholder="e.g. DoodleKing99"
            maxLength={16}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />

          <label style={{ display: 'block', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '1rem', marginBottom: '0.5rem' }}>
            CHOOSE AVATAR COLOR
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatarColor(color)}
                style={{
                  width: '34px',
                  height: '34px',
                  backgroundColor: color,
                  border: avatarColor === color ? '4px solid var(--neon-yellow)' : '2px solid #000',
                  boxShadow: avatarColor === color ? '3px 3px 0 #000' : 'none',
                  cursor: 'pointer',
                  transform: avatarColor === color ? 'scale(1.1)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* MODE TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            className={`btn-brutal w-full ${activeTab === 'join' ? 'btn-cyan' : 'btn-white'}`}
            onClick={() => setActiveTab('join')}
          >
            <LogIn size={18} /> JOIN ROOM
          </button>
          <button
            type="button"
            className={`btn-brutal w-full ${activeTab === 'create' ? 'btn-yellow' : 'btn-white'}`}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={18} /> CREATE ROOM
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'join' ? (
          <form onSubmit={handleJoin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
                ROOM CODE
              </label>
              <input
                type="text"
                className="input-brutal"
                placeholder="ENTER 6-CHAR CODE (e.g. ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-brutal btn-cyan w-full btn-lg"
              disabled={!nickname.trim() || !roomCode.trim() || isLoading}
            >
              <Play size={20} /> {isLoading ? 'JOINING...' : 'ENTER LOBBY'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  TOTAL ROUNDS
                </label>
                <select
                  className="input-brutal"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                >
                  <option value={2}>2 Rounds</option>
                  <option value={3}>3 Rounds</option>
                  <option value={5}>5 Rounds</option>
                  <option value={8}>8 Rounds</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  ROUND TIME
                </label>
                <select
                  className="input-brutal"
                  value={roundDuration}
                  onChange={(e) => setRoundDuration(Number(e.target.value))}
                >
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                  <option value={80}>80 Seconds</option>
                  <option value={120}>120 Seconds</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-brutal btn-yellow w-full btn-lg"
              disabled={!nickname.trim() || isLoading}
            >
              <Sparkles size={20} /> {isLoading ? 'CREATING...' : 'CREATE NEW ROOM'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
