export function registerGameEvents(io, socket, gameManager) {
  // START GAME
  socket.on('start_game', () => {
    const room = gameManager.findRoomByPlayer(socket.id);
    if (!room) return;
    room.startGame(socket.id);
  });

  // CHOOSE WORD (Drawer only)
  socket.on('choose_word', ({ word }) => {
    const room = gameManager.findRoomByPlayer(socket.id);
    if (!room) return;
    room.selectWord(socket.id, word);
  });

  // SUBMIT GUESS OR CHAT MESSAGE
  socket.on('send_message', ({ text }) => {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.trim().slice(0, 150);
    if (!cleanText) return;

    const room = gameManager.findRoomByPlayer(socket.id);
    if (!room) return;

    const player = room.getPlayer(socket.id);
    if (!player) return;

    // Check if game is in drawing phase and player is guessing
    if (room.gameState === 'DRAWING' && !player.isDrawer) {
      const result = room.handleGuess(socket.id, cleanText);
      if (result.isCorrect) {
        // Correct guess! System broadcast event already emitted in handleGuess.
        return;
      }
    }

    // Normal chat message broadcast
    // Prevent drawer or players who have already guessed from spoiling the word in chat!
    if (room.gameState === 'DRAWING' && room.currentWord) {
      const lowerText = cleanText.toLowerCase();
      const lowerWord = room.currentWord.toLowerCase();
      if (lowerText.includes(lowerWord)) {
        // Prevent word leak in chat!
        socket.emit('receive_message', {
          id: Date.now().toString(),
          sender: 'System',
          text: 'Your message contains the secret word and was blocked!',
          type: 'system',
        });
        return;
      }
    }

    io.to(room.roomCode).emit('receive_message', {
      id: Date.now().toString(),
      sender: player.nickname,
      text: cleanText,
      socketId: player.socketId,
      type: 'chat',
      hasGuessed: player.hasGuessed,
    });
  });
}
