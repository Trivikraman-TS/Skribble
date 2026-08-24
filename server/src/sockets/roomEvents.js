import { Player } from '../game/Player.js';
import { GAME_STATES } from '../game/GameState.js';

export function registerRoomEvents(io, socket, gameManager) {
  // CREATE ROOM
  socket.on('create_room', ({ nickname, avatarColor }, callback) => {
    try {
      const cleanNickname = (nickname || 'Player').trim().slice(0, 16);
      const room = gameManager.createRoom();
      const player = new Player(socket.id, cleanNickname, avatarColor || '#FFE600');
      
      room.addPlayer(player);
      gameManager.associatePlayer(socket.id, room.roomCode);

      socket.join(room.roomCode);

      const response = {
        success: true,
        roomCode: room.roomCode,
        player: player.toJSON(),
      };

      if (typeof callback === 'function') callback(response);

      room.broadcastRoomState();
    } catch (err) {
      console.error('Error creating room:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Failed to create room' });
    }
  });

  // JOIN ROOM
  socket.on('join_room', ({ roomCode, nickname, avatarColor }, callback) => {
    try {
      if (!roomCode) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room code is required' });
        return;
      }

      const room = gameManager.getRoom(roomCode);
      if (!room) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room not found! Check room code.' });
        return;
      }

      if (room.players.size >= 12) {
        if (typeof callback === 'function') callback({ success: false, error: 'Room is full! (Max 12 players)' });
        return;
      }

      const cleanNickname = (nickname || 'Player').trim().slice(0, 16);
      const player = new Player(socket.id, cleanNickname, avatarColor || '#00E5FF');
      
      room.addPlayer(player);
      gameManager.associatePlayer(socket.id, room.roomCode);

      socket.join(room.roomCode);

      if (typeof callback === 'function') {
        callback({
          success: true,
          roomCode: room.roomCode,
          player: player.toJSON(),
        });
      }

      // Sync existing stroke history to joining player if game is active
      if (room.gameState === GAME_STATES.DRAWING) {
        socket.emit('canvas_history', { strokes: room.strokeHistory });
      }

      room.broadcastRoomState();

      // System message broadcast
      io.to(room.roomCode).emit('receive_message', {
        id: Date.now().toString(),
        sender: 'System',
        text: `${cleanNickname} joined the room!`,
        type: 'system',
      });
    } catch (err) {
      console.error('Error joining room:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Failed to join room' });
    }
  });

  // UPDATE ROOM SETTINGS (Host only)
  socket.on('update_settings', ({ totalRounds, roundDuration }) => {
    const room = gameManager.findRoomByPlayer(socket.id);
    if (!room || room.hostId !== socket.id) return;

    room.updateSettings({ totalRounds, roundDuration });
  });

  // LEAVE ROOM
  socket.on('leave_room', () => {
    handlePlayerLeave(io, socket, gameManager);
  });
}

export function handlePlayerLeave(io, socket, gameManager) {
  const room = gameManager.findRoomByPlayer(socket.id);
  if (!room) return;

  const player = room.removePlayer(socket.id);
  gameManager.disassociatePlayer(socket.id);
  socket.leave(room.roomCode);

  if (player) {
    io.to(room.roomCode).emit('receive_message', {
      id: Date.now().toString(),
      sender: 'System',
      text: `${player.nickname} left the room.`,
      type: 'system',
    });
  }

  if (room.players.size === 0) {
    gameManager.roomManager.deleteRoom(room.roomCode);
  } else {
    room.broadcastRoomState();
  }
}
