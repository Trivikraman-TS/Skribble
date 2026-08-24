/**
 * Generates a short, uppercase, unambiguous room code (e.g. "SKR-92A" or "PLAY88")
 */
export function generateRoomCode(length = 6) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitted I, O, 0, 1 for clarity
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
