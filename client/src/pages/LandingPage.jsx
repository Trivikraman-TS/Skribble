import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Pencil, Trophy, PaintBucket, Sun, Moon, ArrowRight } from 'lucide-react';

export const LandingPage = ({ onEnterFreestyle }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('skribble_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('skribble_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-cream)',
        color: 'var(--color-text)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      {/* THEME TOGGLE BUTTON AT TOP RIGHT */}
      <button
        type="button"
        className="btn-brutal btn-white btn-sm"
        onClick={toggleTheme}
        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }}
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
      </button>

      <div style={{ maxWidth: '850px', width: '100%', marginTop: '0.5rem' }}>
        
        {/* HERO BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }} className="animate-pop">
          <div
            className="badge-brutal"
            style={{
              backgroundColor: 'var(--neon-pink)',
              color: '#FFF',
              transform: 'rotate(-2deg)',
              marginBottom: '0.5rem',
              fontSize: '0.8rem',
              padding: '0.25rem 0.75rem',
            }}
          >
            SCRIBTURE // MULTIPLAYER MODE
          </div>

          <h1
            style={{
              fontSize: '2.75rem',
              letterSpacing: '-1.5px',
              lineHeight: '1.1',
              marginBottom: '0.4rem',
            }}
          >
            SCRIBTURE
          </h1>

          <h2
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.2rem',
              color: 'var(--neon-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '0.6rem',
            }}
          >
            FREESTYLE MODE
          </h2>

          <p
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--color-muted)',
              maxWidth: '550px',
              margin: '0 auto',
            }}
          >
            Draw fast, fill shapes, and guess secret words in real-time with friends. No downloads required.
          </p>
        </div>

        {/* FREESTYLE CTA BANNER */}
        <div
          className="card-brutal text-center"
          style={{
            backgroundColor: 'var(--neon-yellow)',
            color: '#000000',
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            ⚡ READY TO PLAY?
          </span>
          <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#000000' }}>
            ENTER FREESTYLE LOBBY
          </h3>

          <button
            type="button"
            className="btn-brutal btn-pink btn-lg"
            onClick={onEnterFreestyle}
            style={{
              fontSize: '1.3rem',
              padding: '0.9rem 2.2rem',
              letterSpacing: '1px',
              boxShadow: '5px 5px 0px #000000',
            }}
          >
            <Sparkles size={22} /> FREESTYLE <ArrowRight size={22} />
          </button>
        </div>

        {/* HOW TO PLAY CARDS GRID */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', textAlign: 'center', marginBottom: '1.25rem', letterSpacing: '1px' }}>
            🎮 HOW TO PLAY FREESTYLE
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            
            {/* STEP 1 */}
            <div className="card-brutal" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--color-text)', padding: '1rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--neon-cyan)', border: 'var(--border-thin)', marginBottom: '0.6rem', color: '#000' }}>
                <Users size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                1. CREATE OR JOIN
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: '500' }}>
                Start a new room as host or enter a 6-character code to join your friends in the lobby.
              </p>
            </div>

            {/* STEP 2 */}
            <div className="card-brutal" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--color-text)', padding: '1rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--neon-pink)', border: 'var(--border-thin)', color: '#FFF', marginBottom: '0.6rem' }}>
                <PaintBucket size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                2. DRAW & FLOOD FILL
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: '500' }}>
                Pick 1 of 3 secret words. Use pencils, brush sizes, and the **Paint Bucket Fill** tool to bring your art to life.
              </p>
            </div>

            {/* STEP 3 */}
            <div className="card-brutal" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--color-text)', padding: '1rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--neon-green)', border: 'var(--border-thin)', color: '#000', marginBottom: '0.6rem' }}>
                <Trophy size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                3. SPEED SCORING
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: '500' }}>
                Guess the secret word quickly to earn maximum speed points. Drawers win points when players solve drawings fast!
              </p>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: 'var(--border-thick)', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
          SCRIBTURE MULTIPLAYER MODE // FREESTYLE EDITION
        </footer>

      </div>
    </div>
  );
};
