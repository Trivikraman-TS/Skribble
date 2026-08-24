import { ALL_WORDS } from '../words/wordList.js';

export class WordManager {
  /**
   * Select 3 random unique word choices for the drawer
   */
  static getRandomWordChoices(count = 3, usedWords = new Set()) {
    const available = ALL_WORDS.filter(word => !usedWords.has(word));
    const pool = available.length >= count ? available : ALL_WORDS;
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Convert secret word to blank hint (e.g., "Spider-Man" -> "_ _ _ _ _ _ - _ _ _")
   */
  static generateHint(word, revealedIndexes = new Set()) {
    if (!word) return '';
    
    return word
      .split('')
      .map((char, index) => {
        if (char === ' ' || char === '-') return char;
        if (revealedIndexes.has(index)) return char;
        return '_';
      })
      .join(' ');
  }

  /**
   * Pick a new index to reveal in the secret word hint (skipping spaces, hyphens, and already revealed positions)
   */
  static getNextRevealedIndex(word, currentlyRevealed = new Set()) {
    const unrevealed = [];
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (char !== ' ' && char !== '-' && !currentlyRevealed.has(i)) {
        unrevealed.push(i);
      }
    }
    
    // Don't reveal more than half of the word letters
    const maxReveals = Math.floor(word.replace(/[- ]/g, '').length / 2);
    if (currentlyRevealed.size >= maxReveals || unrevealed.length === 0) {
      return null;
    }

    const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    return randomIndex;
  }
}
