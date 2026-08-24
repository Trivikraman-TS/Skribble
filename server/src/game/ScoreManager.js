export class ScoreManager {
  /**
   * Calculate guesser points based on time remaining (speed of guess)
   */
  static calculateGuesserScore(remainingTime, totalDuration) {
    if (totalDuration <= 0) return 100;
    const ratio = Math.max(0, Math.min(1, remainingTime / totalDuration));
    // Up to 500 points for fastest guessers, scaling down to min 100 points
    return Math.round(100 + 400 * ratio);
  }

  /**
   * Calculate drawer points based on speed & ratio of correct guessers
   * @param {Array<number>} guessTimeRatios Array of (remainingTime / totalDuration) ratios for each correct guesser
   * @param {number} totalGuessers Total number of guessers in room
   */
  static calculateDrawerScore(guessTimeRatios, totalGuessers) {
    if (totalGuessers <= 0 || !guessTimeRatios || guessTimeRatios.length === 0) return 0;
    
    // Average speed ratio of all players who guessed
    const sumRatio = guessTimeRatios.reduce((acc, r) => acc + r, 0);
    const avgSpeedRatio = sumRatio / guessTimeRatios.length;

    // Participation ratio
    const completionRatio = guessTimeRatios.length / totalGuessers;

    // Up to 400 bonus points for fast drawings that everyone guessed quickly
    return Math.round((100 + 300 * avgSpeedRatio) * completionRatio);
  }
}
