export class Player {
  constructor(socketId, nickname, avatarColor = '#FFE600') {
    this.socketId = socketId;
    this.nickname = nickname;
    this.avatarColor = avatarColor;
    this.score = 0;
    this.roundPoints = 0;
    this.isHost = false;
    this.hasGuessed = false;
    this.isDrawer = false;
    this.connected = true;
  }

  resetRoundState() {
    this.hasGuessed = false;
    this.isDrawer = false;
    this.roundPoints = 0;
  }

  toJSON() {
    return {
      socketId: this.socketId,
      nickname: this.nickname,
      avatarColor: this.avatarColor,
      score: this.score,
      roundPoints: this.roundPoints,
      isHost: this.isHost,
      hasGuessed: this.hasGuessed,
      isDrawer: this.isDrawer,
      connected: this.connected,
    };
  }
}
