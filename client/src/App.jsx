import React from 'react';
import { useGame } from './context/GameContext';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';

export const App = () => {
  const { roomState } = useGame();

  if (!roomState) {
    return <HomePage />;
  }

  if (roomState.gameState === 'LOBBY') {
    return <LobbyPage />;
  }

  return <GamePage />;
};

export default App;
