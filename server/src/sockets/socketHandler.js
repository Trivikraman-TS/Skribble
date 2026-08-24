import { registerRoomEvents, handlePlayerLeave } from './roomEvents.js';
import { registerGameEvents } from './gameEvents.js';
import { registerDrawingEvents } from './drawingEvents.js';

export function setupSocketHandlers(io, gameManager) {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}`);

    // Register modular event listeners
    registerRoomEvents(io, socket, gameManager);
    registerGameEvents(io, socket, gameManager);
    registerDrawingEvents(io, socket, gameManager);

    // Disconnect event
    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] ID: ${socket.id}, Reason: ${reason}`);
      handlePlayerLeave(io, socket, gameManager);
    });
  });
}
