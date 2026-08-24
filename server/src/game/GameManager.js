import { RoomManager } from '../rooms/RoomManager.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.roomManager = new RoomManager(io);

    // Periodically clean up empty rooms every 5 minutes
    setInterval(() => {
      this.roomManager.cleanupEmptyRooms();
    }, 5 * 60 * 1000);
  }

  createRoom() {
    return this.roomManager.createRoom();
  }

  getRoom(roomCode) {
    return this.roomManager.getRoom(roomCode);
  }

  findRoomByPlayer(socketId) {
    return this.roomManager.findRoomByPlayer(socketId);
  }

  associatePlayer(socketId, roomCode) {
    this.roomManager.associatePlayerWithRoom(socketId, roomCode);
  }

  disassociatePlayer(socketId) {
    this.roomManager.removePlayerFromRoomMap(socketId);
  }
}
