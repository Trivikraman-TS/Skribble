import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';

export const App = () => {
  const { roomState } = useGame();
  const [viewMode, setViewMode] = useState('landing'); // 'landing' | 'freestyle'

  if (!roomState) {
    if (viewMode === 'landing') {
      return <LandingPage onEnterFreestyle={() => setViewMode('freestyle')} />;
    }
    return <HomePage onReturnToLanding={() => setViewMode('landing')} />;
  }

  if (roomState.gameState === 'LOBBY') {
    return <LobbyPage />;
  }

  return <GamePage />;
};

export default App;
