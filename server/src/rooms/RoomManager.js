import { GameRoom } from '../game/GameRoom.js';
import { generateRoomCode } from '../utils/roomCodeGenerator.js';

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> GameRoom
    this.playerRoomMap = new Map(); // socketId -> roomCode
  }

  createRoom() {
    let roomCode = generateRoomCode(6);
    // Ensure uniqueness
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode(6);
    }

    const roomId = `room_${Date.now()}_${roomCode}`;
    const room = new GameRoom(roomId, roomCode, this.io);
    this.rooms.set(roomCode, room);

    return room;
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    return this.rooms.get(roomCode.toUpperCase().trim()) || null;
  }

  findRoomByPlayer(socketId) {
    const roomCode = this.playerRoomMap.get(socketId);
    if (!roomCode) return null;
    return this.getRoom(roomCode);
  }

  associatePlayerWithRoom(socketId, roomCode) {
    this.playerRoomMap.set(socketId, roomCode);
  }

  removePlayerFromRoomMap(socketId) {
    this.playerRoomMap.delete(socketId);
  }

  deleteRoom(roomCode) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.clearTimer();
      this.rooms.delete(roomCode);
    }
  }

  cleanupEmptyRooms() {
    for (const [code, room] of this.rooms.entries()) {
      if (room.players.size === 0) {
        this.deleteRoom(code);
      }
    }
  }
}
