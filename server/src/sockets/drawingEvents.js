import { GAME_STATES } from '../game/GameState.js';

export function registerDrawingEvents(io, socket, gameManager) {
  // Helper to verify if socket is active drawer
  const isDrawer = () => {
    const room = gameManager.findRoomByPlayer(socket.id);
    if (!room) return null;
    if (room.gameState !== GAME_STATES.DRAWING) return null;
    if (room.currentDrawerId !== socket.id) return null;
    return room;
  };

  // DRAWING STROKE
  socket.on('drawing_stroke', (strokeData) => {
    const room = isDrawer();
    if (!room) return;

    room.addStroke(strokeData);
    // Broadcast stroke to all other players in the room
    socket.to(room.roomCode).emit('drawing_stroke', strokeData);
  });

  // PAINT BUCKET FLOOD FILL
  socket.on('drawing_fill', (fillData) => {
    const room = isDrawer();
    if (!room) return;

    room.addStroke({ type: 'fill', ...fillData });
    socket.to(room.roomCode).emit('drawing_fill', fillData);
  });

  // CLEAR CANVAS
  socket.on('clear_canvas', () => {
    const room = isDrawer();
    if (!room) return;

    room.clearCanvas();
    io.to(room.roomCode).emit('clear_canvas');
  });

  // UNDO
  socket.on('undo', () => {
    const room = isDrawer();
    if (!room) return;

    room.undoStroke();
    io.to(room.roomCode).emit('undo');
  });
}
