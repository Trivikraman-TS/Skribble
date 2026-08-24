import { GAME_STATES } from './GameState.js';
import { WordManager } from './WordManager.js';
import { ScoreManager } from './ScoreManager.js';

export class GameRoom {
  constructor(roomId, roomCode, io) {
    this.roomId = roomId;
    this.roomCode = roomCode;
    this.io = io;
    
    this.hostId = null;
    this.players = new Map(); // socketId -> Player
    this.gameState = GAME_STATES.LOBBY;
    
    // Configurable settings
    this.totalRounds = 3;
    this.roundDuration = 80; // seconds
    
    // Round state
    this.currentRound = 0;
    this.drawerQueue = []; // array of socketIds
    this.currentDrawerIndex = 0;
    this.currentDrawerId = null;
    this.currentWord = null;
    this.wordChoices = [];
    this.hint = '';
    this.revealedIndexes = new Set();
    
    // Timer
    this.remainingTime = 0;
    this.timerInterval = null;
    
    // Canvas history
    this.strokeHistory = [];
    
    // Used words
    this.usedWords = new Set();
  }

  addPlayer(player) {
    if (this.players.size === 0) {
      player.isHost = true;
      this.hostId = player.socketId;
    }
    this.players.set(player.socketId, player);
    return player;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (!player) return null;

    this.players.delete(socketId);

    // If host left, assign new host
    if (player.isHost && this.players.size > 0) {
      const nextHost = this.players.values().next().value;
      nextHost.isHost = true;
      this.hostId = nextHost.socketId;
    }

    // If current drawer left during active game, handle drawer disconnect
    if (this.currentDrawerId === socketId && 
       (this.gameState === GAME_STATES.CHOOSING_WORD || this.gameState === GAME_STATES.DRAWING)) {
      this.handleDrawerDisconnect();
    }

    return player;
  }

  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  getPlayersList() {
    return Array.from(this.players.values()).map(p => p.toJSON());
  }

  getGuesserCount() {
    // Number of active players minus drawer
    return Math.max(0, this.players.size - 1);
  }

  getCorrectGuesserCount() {
    let count = 0;
    for (const player of this.players.values()) {
      if (player.hasGuessed && !player.isDrawer) count++;
    }
    return count;
  }

  updateSettings({ totalRounds, roundDuration }) {
    if (this.gameState !== GAME_STATES.LOBBY) return;
    if (totalRounds && totalRounds >= 1 && totalRounds <= 10) {
      this.totalRounds = parseInt(totalRounds, 10);
    }
    if (roundDuration && roundDuration >= 30 && roundDuration <= 180) {
      this.roundDuration = parseInt(roundDuration, 10);
    }
    this.broadcastRoomState();
  }

  startGame(hostSocketId) {
    if (this.hostId !== hostSocketId) return false;
    if (this.players.size < 2) return false; // Need at least 2 players
    if (this.gameState !== GAME_STATES.LOBBY && this.gameState !== GAME_STATES.GAME_END) return false;

    // Reset game counters & scores
    this.currentRound = 1;
    this.usedWords.clear();
    for (const player of this.players.values()) {
      player.score = 0;
      player.resetRoundState();
    }

    // Prepare drawer queue
    this.drawerQueue = Array.from(this.players.keys());
    this.currentDrawerIndex = 0;

    this.startWordSelectionPhase();
    return true;
  }

  startWordSelectionPhase() {
    this.clearTimer();
    this.strokeHistory = [];
    this.revealedIndexes.clear();
    this.guessTimeRatios = [];
    
    // Reset player round flags
    for (const player of this.players.values()) {
      player.resetRoundState();
    }

    // Set drawer
    this.currentDrawerId = this.drawerQueue[this.currentDrawerIndex];
    const drawer = this.players.get(this.currentDrawerId);
    if (!drawer) {
      this.nextTurn();
      return;
    }
    drawer.isDrawer = true;

    this.gameState = GAME_STATES.CHOOSING_WORD;
    this.wordChoices = WordManager.getRandomWordChoices(3, this.usedWords);
    
    // Notify all players about state change
    this.broadcastRoomState();
    
    // Send secret word choices ONLY to the drawer socket
    this.io.to(this.currentDrawerId).emit('word_choices', { choices: this.wordChoices });

    // Start 15s timer for choosing word
    this.remainingTime = 15;
    this.io.to(this.roomCode).emit('timer_update', { remainingTime: this.remainingTime, phase: 'CHOOSING' });

    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.io.to(this.roomCode).emit('timer_update', { remainingTime: this.remainingTime, phase: 'CHOOSING' });

      if (this.remainingTime <= 0) {
        this.clearTimer();
        // Auto-pick first word if drawer timed out
        this.selectWord(this.currentDrawerId, this.wordChoices[0]);
      }
    }, 1000);
  }

  selectWord(drawerSocketId, chosenWord) {
    if (this.gameState !== GAME_STATES.CHOOSING_WORD) return false;
    if (this.currentDrawerId !== drawerSocketId) return false;
    if (!this.wordChoices.includes(chosenWord)) chosenWord = this.wordChoices[0];

    this.clearTimer();
    this.currentWord = chosenWord;
    this.usedWords.add(chosenWord);
    this.hint = WordManager.generateHint(chosenWord, this.revealedIndexes);
    
    this.gameState = GAME_STATES.DRAWING;
    this.remainingTime = this.roundDuration;

    // Send round_started event
    // To drawer: include the secret word!
    this.io.to(this.currentDrawerId).emit('round_started', {
      drawerId: this.currentDrawerId,
      drawerName: this.players.get(this.currentDrawerId)?.nickname,
      secretWord: this.currentWord,
      hint: this.currentWord,
      duration: this.roundDuration,
    });

    // To others: do NOT include secret word, only hint!
    this.io.to(this.roomCode).except(this.currentDrawerId).emit('round_started', {
      drawerId: this.currentDrawerId,
      drawerName: this.players.get(this.currentDrawerId)?.nickname,
      hint: this.hint,
      duration: this.roundDuration,
    });

    this.broadcastRoomState();

    // Start drawing round timer
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.io.to(this.roomCode).emit('timer_update', { remainingTime: this.remainingTime, phase: 'DRAWING' });

      // Periodically reveal hints at 50% and 25% timer remaining
      if (this.remainingTime === Math.floor(this.roundDuration * 0.5) ||
          this.remainingTime === Math.floor(this.roundDuration * 0.25)) {
        this.revealHintLetter();
      }

      if (this.remainingTime <= 0) {
        this.endRound('Time limit reached!');
      }
    }, 1000);

    return true;
  }

  revealHintLetter() {
    if (!this.currentWord) return;
    const nextIdx = WordManager.getNextRevealedIndex(this.currentWord, this.revealedIndexes);
    if (nextIdx !== null) {
      this.revealedIndexes.add(nextIdx);
      this.hint = WordManager.generateHint(this.currentWord, this.revealedIndexes);
      // Broadcast updated hint to non-drawers
      this.io.to(this.roomCode).except(this.currentDrawerId).emit('hint_update', { hint: this.hint });
    }
  }

  handleGuess(playerSocketId, guessText) {
    if (this.gameState !== GAME_STATES.DRAWING) return { isCorrect: false, isAlreadyGuessed: false };

    const player = this.players.get(playerSocketId);
    if (!player || player.isDrawer || player.hasGuessed) {
      return { isCorrect: false, isAlreadyGuessed: player?.hasGuessed || false };
    }

    const cleanGuess = guessText.trim().toLowerCase();
    const cleanWord = this.currentWord.trim().toLowerCase();

    if (cleanGuess === cleanWord) {
      player.hasGuessed = true;
      
      // Track speed ratio for drawer bonus
      const speedRatio = Math.max(0, Math.min(1, this.remainingTime / this.roundDuration));
      if (!this.guessTimeRatios) this.guessTimeRatios = [];
      this.guessTimeRatios.push(speedRatio);

      // Calculate points
      const points = ScoreManager.calculateGuesserScore(this.remainingTime, this.roundDuration);
      player.roundPoints = points;
      player.score += points;

      // Broadcast correct guess alert (omitting the exact word string so chat doesn't leak)
      this.io.to(this.roomCode).emit('correct_guess', {
        playerSocketId: player.socketId,
        nickname: player.nickname,
        points,
        score: player.score,
      });

      this.broadcastRoomState();

      // Check if all guessers have correctly guessed
      const guessersCount = this.getGuesserCount();
      const correctCount = this.getCorrectGuesserCount();

      if (correctCount >= guessersCount) {
        this.endRound('Everyone guessed correctly!');
      }

      return { isCorrect: true, isAlreadyGuessed: false };
    }

    return { isCorrect: false, isAlreadyGuessed: false };
  }

  endRound(reason = '') {
    this.clearTimer();
    this.gameState = GAME_STATES.ROUND_END;

    // Calculate drawer bonus points based on speed and participation
    const drawer = this.players.get(this.currentDrawerId);
    let drawerPoints = 0;
    if (drawer) {
      const guessersCount = this.getGuesserCount();
      drawerPoints = ScoreManager.calculateDrawerScore(this.guessTimeRatios || [], guessersCount);
      drawer.roundPoints = drawerPoints;
      drawer.score += drawerPoints;
    }

    this.broadcastRoomState();

    this.io.to(this.roomCode).emit('round_ended', {
      reason,
      secretWord: this.currentWord,
      drawerName: drawer ? drawer.nickname : 'Drawer',
      drawerPoints,
      scores: this.getPlayersList(),
    });

    // Pause 5s to show round results, then proceed to next turn or end game
    setTimeout(() => {
      this.nextTurn();
    }, 5000);
  }

  nextTurn() {
    this.currentDrawerIndex++;

    // If all players have drawn in this round, advance to next round
    if (this.currentDrawerIndex >= this.drawerQueue.length) {
      this.currentRound++;
      this.currentDrawerIndex = 0;
      // Re-shuffle or refresh drawer queue with connected players
      this.drawerQueue = Array.from(this.players.keys());
    }

    // Check if game is over
    if (this.currentRound > this.totalRounds || this.drawerQueue.length < 2) {
      this.endGame();
    } else {
      this.startWordSelectionPhase();
    }
  }

  endGame() {
    this.clearTimer();
    this.gameState = GAME_STATES.GAME_END;
    
    // Sort players by final score
    const finalStandings = this.getPlayersList().sort((a, b) => b.score - a.score);

    this.broadcastRoomState();

    this.io.to(this.roomCode).emit('game_ended', {
      standings: finalStandings,
    });
  }

  handleDrawerDisconnect() {
    this.clearTimer();
    this.io.to(this.roomCode).emit('receive_message', {
      id: Date.now().toString(),
      sender: 'System',
      text: 'The drawer disconnected! Moving to next turn...',
      type: 'system',
    });
    setTimeout(() => {
      this.nextTurn();
    }, 2000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  addStroke(strokeData) {
    this.strokeHistory.push(strokeData);
    // Keep max 2000 strokes in memory per round to prevent memory bloat
    if (this.strokeHistory.length > 2000) {
      this.strokeHistory.shift();
    }
  }

  clearCanvas() {
    this.strokeHistory = [];
  }

  undoStroke() {
    if (this.strokeHistory.length > 0) {
      this.strokeHistory.pop();
    }
  }

  broadcastRoomState() {
    const publicState = {
      roomId: this.roomId,
      roomCode: this.roomCode,
      hostId: this.hostId,
      gameState: this.gameState,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      roundDuration: this.roundDuration,
      currentDrawerId: this.currentDrawerId,
      hint: this.gameState === GAME_STATES.DRAWING ? this.hint : '',
      players: this.getPlayersList(),
    };

    this.io.to(this.roomCode).emit('room_state', publicState);
  }
}
