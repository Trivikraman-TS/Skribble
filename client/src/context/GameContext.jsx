import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [wordChoices, setWordChoices] = useState([]);
  const [secretWord, setSecretWord] = useState('');
  const [hint, setHint] = useState('');
  const [timer, setTimer] = useState({ remainingTime: 0, phase: 'LOBBY' });
  const [chatMessages, setChatMessages] = useState([]);
  const [roundEndData, setRoundEndData] = useState(null);
  const [gameEndData, setGameEndData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    // ROOM STATE UPDATE
    socket.on('room_state', (state) => {
      setRoomState(state);
      
      if (state.gameState !== 'GAME_END') {
        setGameEndData(null);
      }

      // Update local player state if player exists in list
      if (socket.id && state.players) {
        const me = state.players.find(p => p.socketId === socket.id);
        if (me) setCurrentPlayer(me);
      }
    });

    // TIMER UPDATE
    socket.on('timer_update', (data) => {
      setTimer(data);
    });

    // WORD CHOICES FOR DRAWER
    socket.on('word_choices', ({ choices }) => {
      setWordChoices(choices);
    });

    // ROUND STARTED
    socket.on('round_started', (data) => {
      setWordChoices([]);
      setRoundEndData(null);
      setGameEndData(null);
      if (data.secretWord) {
        setSecretWord(data.secretWord);
      } else {
        setSecretWord('');
      }
      if (data.hint) {
        setHint(data.hint);
      }
    });

    // HINT UPDATE
    socket.on('hint_update', ({ hint }) => {
      setHint(hint);
    });

    // CHAT / GUESS MESSAGES
    socket.on('receive_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    // CORRECT GUESS NOTIFICATION
    socket.on('correct_guess', ({ nickname, points }) => {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'System',
          text: `🎉 ${nickname} guessed the word correctly! (+${points} pts)`,
          type: 'correct',
        },
      ]);
    });

    // ROUND ENDED
    socket.on('round_ended', (data) => {
      setRoundEndData(data);
      setSecretWord(data.secretWord);
    });

    // GAME ENDED
    socket.on('game_ended', (data) => {
      setGameEndData(data);
    });

    return () => {
      socket.off('room_state');
      socket.off('timer_update');
      socket.off('word_choices');
      socket.off('round_started');
      socket.off('hint_update');
      socket.off('receive_message');
      socket.off('correct_guess');
      socket.off('round_ended');
      socket.off('game_ended');
    };
  }, [socket]);

  // Actions
  const createRoom = (nickname, avatarColor, callback) => {
    if (!socket) return;
    setErrorMessage('');
    socket.emit('create_room', { nickname, avatarColor }, (response) => {
      if (response.success) {
        setCurrentPlayer(response.player);
      } else {
        setErrorMessage(response.error || 'Failed to create room');
      }
      if (callback) callback(response);
    });
  };

  const joinRoom = (roomCode, nickname, avatarColor, callback) => {
    if (!socket) return;
    setErrorMessage('');
    socket.emit('join_room', { roomCode, nickname, avatarColor }, (response) => {
      if (response.success) {
        setCurrentPlayer(response.player);
      } else {
        setErrorMessage(response.error || 'Failed to join room');
      }
      if (callback) callback(response);
    });
  };

  const updateSettings = (totalRounds, roundDuration) => {
    if (!socket) return;
    socket.emit('update_settings', { totalRounds, roundDuration });
  };

  const startGame = () => {
    if (!socket) return;
    setGameEndData(null);
    setRoundEndData(null);
    socket.emit('start_game');
  };

  const chooseWord = (word) => {
    if (!socket) return;
    socket.emit('choose_word', { word });
    setSecretWord(word);
    setWordChoices([]);
  };

  const sendMessage = (text) => {
    if (!socket || !text.trim()) return;
    socket.emit('send_message', { text });
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit('leave_room');
    setRoomState(null);
    setCurrentPlayer(null);
    setChatMessages([]);
    setRoundEndData(null);
    setGameEndData(null);
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        isConnected,
        currentPlayer,
        roomState,
        wordChoices,
        secretWord,
        hint,
        timer,
        chatMessages,
        roundEndData,
        gameEndData,
        errorMessage,
        setErrorMessage,
        createRoom,
        joinRoom,
        updateSettings,
        startGame,
        chooseWord,
        sendMessage,
        leaveRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
