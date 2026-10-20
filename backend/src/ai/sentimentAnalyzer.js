/**
 * Rule-Based Review Sentiment Analyzer
 * Evaluates sentiment (positive, neutral, negative) based on star rating (1-5)
 * and an English emotion keyword lexicon.
 * NOTE: This is a transparent rule-based heuristic classifier, not machine learning.
 */

const POSITIVE_LEXICON = [
  'great',
  'good',
  'love',
  'loved',
  'amazing',
  'masterpiece',
  'excellent',
  'brilliant',
  'fantastic',
  'wonderful',
  'enjoyed',
  'best',
  'superb',
  'inspiring',
  'touching',
  'beautiful',
  'hilarious',
  'fun',
  'thrilling',
  'compelling',
  'awesome',
  'flawless',
  'must-watch',
  'captivating',
  'stellar',
  'incredible',
  'phenomenal',
];

const NEGATIVE_LEXICON = [
  'bad',
  'worst',
  'boring',
  'terrible',
  'horrible',
  'awful',
  'waste',
  'poor',
  'hate',
  'hated',
  'disappointing',
  'disaster',
  'dull',
  'pointless',
  'cliche',
  'cliché',
  'annoying',
  'crap',
  'overrated',
  'slow',
  'unbearable',
  'garbage',
  'trash',
  'pathetic',
  'predictable',
];

/**
 * Analyzes movie review sentiment using rating and text lexicon.
 *
 * @param {number} rating - User star rating (1-5)
 * @param {string} comment - User comment text
 * @returns {'positive' | 'neutral' | 'negative'}
 */
const analyzeSentiment = (rating, comment = '') => {
  let score = 0;

  // 1. Rating-based signal
  const numRating = Number(rating);
  if (numRating === 5) score += 2.5;
  else if (numRating === 4) score += 1.5;
  else if (numRating === 3) score += 0.0;
  else if (numRating === 2) score -= 1.5;
  else if (numRating === 1) score -= 2.5;

  // 2. Lexicon keyword match
  if (comment && typeof comment === 'string') {
    const cleanWords = comment
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    let posCount = 0;
    let negCount = 0;

    for (const word of cleanWords) {
      if (POSITIVE_LEXICON.includes(word)) posCount++;
      if (NEGATIVE_LEXICON.includes(word)) negCount++;
    }

    score += posCount * 1.0;
    score -= negCount * 1.0;
  }

  // 3. Final classification thresholds
  if (score >= 1.0) return 'positive';
  if (score <= -1.0) return 'negative';
  return 'neutral';
};

module.exports = {
  POSITIVE_LEXICON,
  NEGATIVE_LEXICON,
  analyzeSentiment,
};
