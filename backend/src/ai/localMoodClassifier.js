/**
 * Rule-Based Mood Classifier with Hinglish Support, Negation, Intensifiers,
 * and Contrast Pattern Analysis ("I feel low and want something uplifting" -> Sad).
 */

const { MOOD_GENRES } = require('../constants/moods');

// Weighted keyword & phrase dictionaries per mood
const MOOD_DICTIONARY = {
  Happy: [
    { phrase: 'not happy', weight: -3.0, mapsTo: 'Sad' },
    { phrase: 'not feeling good', weight: -2.5, mapsTo: 'Sad' },
    { phrase: 'dont feel good', weight: -2.5, mapsTo: 'Sad' },
    { phrase: "don't feel good", weight: -2.5, mapsTo: 'Sad' },
    { phrase: 'nahi khush', weight: -3.0, mapsTo: 'Sad' },
    { phrase: 'good vibes', weight: 2.5 },
    { phrase: 'bahut khush', weight: 3.0 },
    { phrase: 'bohot khush', weight: 3.0 },
    { phrase: 'great day', weight: 2.0 },
    { phrase: 'happy', weight: 1.5 },
    { phrase: 'joy', weight: 1.5 },
    { phrase: 'cheerful', weight: 2.0 },
    { phrase: 'delighted', weight: 2.0 },
    { phrase: 'glad', weight: 1.2 },
    { phrase: 'smiling', weight: 1.5 },
    { phrase: 'laughter', weight: 1.8 },
    { phrase: 'laugh', weight: 1.5 },
    { phrase: 'hilarious', weight: 2.0 },
    { phrase: 'funny', weight: 1.5 },
    { phrase: 'celebrate', weight: 1.8 },
    { phrase: 'celebrating', weight: 1.8 },
    { phrase: 'ecstatic', weight: 2.5 },
    { phrase: 'fantastic', weight: 1.5 },
    { phrase: 'wonderful', weight: 1.5 },
    { phrase: 'upbeat', weight: 1.8 },
    { phrase: 'khush', weight: 2.0 },
    { phrase: 'khushi', weight: 2.0 },
    { phrase: 'hasna', weight: 1.8 },
    { phrase: 'hansna', weight: 1.8 },
    { phrase: 'maza', weight: 1.8 },
    { phrase: 'mast', weight: 1.8 },
    { phrase: 'shandaar', weight: 1.8 },
  ],
  Sad: [
    { phrase: 'heart broken', weight: 3.0 },
    { phrase: 'heartbroken', weight: 3.0 },
    { phrase: 'feeling down', weight: 2.5 },
    { phrase: 'feeling low', weight: 2.8 },
    { phrase: 'feel low', weight: 2.8 },
    { phrase: 'broken heart', weight: 3.0 },
    { phrase: 'tear up', weight: 2.2 },
    { phrase: 'bohot udaas', weight: 3.0 },
    { phrase: 'bahut udaas', weight: 3.0 },
    { phrase: 'sad', weight: 1.8 },
    { phrase: 'down', weight: 1.2 },
    { phrase: 'low', weight: 1.2 },
    { phrase: 'crying', weight: 2.5 },
    { phrase: 'cry', weight: 2.0 },
    { phrase: 'tears', weight: 2.0 },
    { phrase: 'depressed', weight: 2.8 },
    { phrase: 'depression', weight: 2.8 },
    { phrase: 'lonely', weight: 2.2 },
    { phrase: 'gloomy', weight: 2.0 },
    { phrase: 'sorrow', weight: 2.2 },
    { phrase: 'grief', weight: 2.5 },
    { phrase: 'miserable', weight: 2.2 },
    { phrase: 'painful', weight: 1.8 },
    { phrase: 'melancholy', weight: 2.2 },
    { phrase: 'hopeless', weight: 2.5 },
    { phrase: 'heartbreak', weight: 2.8 },
    { phrase: 'udaas', weight: 2.2 },
    { phrase: 'udas', weight: 2.2 },
    { phrase: 'dukh', weight: 2.0 },
    { phrase: 'dukhi', weight: 2.2 },
    { phrase: 'rona', weight: 2.2 },
    { phrase: 'akela', weight: 2.0 },
    { phrase: 'gham', weight: 2.0 },
    { phrase: 'dard', weight: 2.0 },
    { phrase: 'pareshan', weight: 1.8 },
    { phrase: 'pareshaan', weight: 1.8 },
  ],
  Romantic: [
    { phrase: 'in love', weight: 3.0 },
    { phrase: 'true love', weight: 2.8 },
    { phrase: 'pyaar bhari', weight: 3.0 },
    { phrase: 'candlelight dinner', weight: 2.5 },
    { phrase: 'romantic', weight: 2.2 },
    { phrase: 'romance', weight: 2.2 },
    { phrase: 'love', weight: 1.6 },
    { phrase: 'passion', weight: 1.8 },
    { phrase: 'passionate', weight: 2.0 },
    { phrase: 'dating', weight: 1.5 },
    { phrase: 'date', weight: 1.2 },
    { phrase: 'crush', weight: 2.0 },
    { phrase: 'sweetheart', weight: 2.0 },
    { phrase: 'soulmate', weight: 2.5 },
    { phrase: 'kiss', weight: 2.0 },
    { phrase: 'cuddle', weight: 2.2 },
    { phrase: 'affection', weight: 1.8 },
    { phrase: 'pyaar', weight: 2.5 },
    { phrase: 'pyar', weight: 2.5 },
    { phrase: 'ishq', weight: 2.5 },
    { phrase: 'mohabbat', weight: 2.5 },
    { phrase: 'prem', weight: 2.0 },
    { phrase: 'deewana', weight: 2.0 },
    { phrase: 'deewani', weight: 2.0 },
  ],
  Angry: [
    { phrase: 'pissed off', weight: 3.0 },
    { phrase: 'bohot gussa', weight: 3.0 },
    { phrase: 'bahut gussa', weight: 3.0 },
    { phrase: 'lose my temper', weight: 2.8 },
    { phrase: 'angry', weight: 2.2 },
    { phrase: 'rage', weight: 2.5 },
    { phrase: 'furious', weight: 2.5 },
    { phrase: 'mad', weight: 1.5 },
    { phrase: 'irritated', weight: 1.8 },
    { phrase: 'annoyed', weight: 1.8 },
    { phrase: 'revenge', weight: 2.5 },
    { phrase: 'vengeance', weight: 2.5 },
    { phrase: 'wrath', weight: 2.5 },
    { phrase: 'hateful', weight: 2.0 },
    { phrase: 'frustrated', weight: 1.8 },
    { phrase: 'destroy', weight: 1.8 },
    { phrase: 'fight', weight: 1.6 },
    { phrase: 'gussa', weight: 2.5 },
    { phrase: 'naraz', weight: 1.8 },
    { phrase: 'naraaz', weight: 1.8 },
    { phrase: 'ladai', weight: 2.0 },
    { phrase: 'dushmani', weight: 2.2 },
    { phrase: 'aakrosh', weight: 2.5 },
  ],
  Excited: [
    { phrase: 'blown away', weight: 2.8 },
    { phrase: 'mind blown', weight: 3.0 },
    { phrase: 'pumped up', weight: 3.0 },
    { phrase: 'on edge of my seat', weight: 2.8 },
    { phrase: 'excited', weight: 2.2 },
    { phrase: 'thrilled', weight: 2.2 },
    { phrase: 'thrill', weight: 2.0 },
    { phrase: 'adventure', weight: 1.8 },
    { phrase: 'adrenaline', weight: 2.5 },
    { phrase: 'hype', weight: 2.0 },
    { phrase: 'energetic', weight: 1.8 },
    { phrase: 'hyped', weight: 2.0 },
    { phrase: 'wild', weight: 1.5 },
    { phrase: 'epic', weight: 1.8 },
    { phrase: 'sensational', weight: 1.8 },
    { phrase: 'rollercoaster', weight: 2.0 },
    { phrase: 'josh', weight: 2.5 },
    { phrase: 'utsah', weight: 2.2 },
    { phrase: 'dhamaka', weight: 2.2 },
    { phrase: 'toofani', weight: 2.2 },
  ],
  Relaxed: [
    { phrase: 'peace of mind', weight: 2.8 },
    { phrase: 'laid back', weight: 2.5 },
    { phrase: 'kick back', weight: 2.2 },
    { phrase: 'not relaxed', weight: -2.5 },
    { phrase: 'relaxed', weight: 2.2 },
    { phrase: 'relax', weight: 2.0 },
    { phrase: 'calm', weight: 2.0 },
    { phrase: 'peaceful', weight: 2.2 },
    { phrase: 'chill', weight: 1.8 },
    { phrase: 'chilling', weight: 1.8 },
    { phrase: 'soothing', weight: 2.0 },
    { phrase: 'zen', weight: 2.0 },
    { phrase: 'gentle', weight: 1.5 },
    { phrase: 'quiet', weight: 1.2 },
    { phrase: 'unwind', weight: 2.2 },
    { phrase: 'cozy', weight: 2.0 },
    { phrase: 'serene', weight: 2.2 },
    { phrase: 'tranquil', weight: 2.2 },
    { phrase: 'sukoon', weight: 2.5 },
    { phrase: 'shanti', weight: 2.2 },
    { phrase: 'aaram', weight: 2.2 },
    { phrase: 'aaraam', weight: 2.2 },
    { phrase: 'chain', weight: 1.8 },
    { phrase: 'thanda', weight: 1.5 },
  ],
  Fearful: [
    { phrase: 'scared to death', weight: 3.0 },
    { phrase: 'goose bumps', weight: 2.5 },
    { phrase: 'goosebumps', weight: 2.5 },
    { phrase: 'fearful', weight: 2.2 },
    { phrase: 'scared', weight: 2.2 },
    { phrase: 'spooky', weight: 2.2 },
    { phrase: 'scary', weight: 2.2 },
    { phrase: 'horror', weight: 2.2 },
    { phrase: 'terrified', weight: 2.8 },
    { phrase: 'afraid', weight: 2.0 },
    { phrase: 'creepy', weight: 2.0 },
    { phrase: 'haunted', weight: 2.2 },
    { phrase: 'nightmare', weight: 2.2 },
    { phrase: 'panic', weight: 2.2 },
    { phrase: 'dread', weight: 2.2 },
    { phrase: 'eerie', weight: 2.0 },
    { phrase: 'frightened', weight: 2.2 },
    { phrase: 'dar', weight: 2.5 },
    { phrase: 'darr', weight: 2.5 },
    { phrase: 'dara', weight: 2.0 },
    { phrase: 'khauf', weight: 2.5 },
    { phrase: 'bhoot', weight: 2.2 },
    { phrase: 'chudail', weight: 2.2 },
  ],
  Motivated: [
    { phrase: 'hard work', weight: 2.5 },
    { phrase: 'never give up', weight: 3.0 },
    { phrase: 'hustle hard', weight: 2.8 },
    { phrase: 'motivated', weight: 2.2 },
    { phrase: 'inspired', weight: 2.2 },
    { phrase: 'ambition', weight: 2.2 },
    { phrase: 'ambitious', weight: 2.2 },
    { phrase: 'driven', weight: 2.0 },
    { phrase: 'focus', weight: 1.5 },
    { phrase: 'hustle', weight: 2.2 },
    { phrase: 'succeed', weight: 2.0 },
    { phrase: 'success', weight: 2.0 },
    { phrase: 'winner', weight: 2.0 },
    { phrase: 'win', weight: 1.5 },
    { phrase: 'champion', weight: 2.2 },
    { phrase: 'triumph', weight: 2.5 },
    { phrase: 'discipline', weight: 2.0 },
    { phrase: 'persevere', weight: 2.5 },
    { phrase: 'perseverance', weight: 2.5 },
    { phrase: 'achieve', weight: 2.0 },
    { phrase: 'prerna', weight: 2.5 },
    { phrase: 'jeet', weight: 2.2 },
    { phrase: 'koshish', weight: 1.8 },
    { phrase: 'kamyabi', weight: 2.2 },
    { phrase: 'junoon', weight: 2.5 },
  ],
};

const INTENSIFIERS = [
  'really',
  'very',
  'extremely',
  'super',
  'so',
  'deeply',
  'bohot',
  'bahut',
  'zyada',
  'ziyada',
  'immensely',
  'too',
];

const NEGATION_WORDS = ['not', 'never', "don't", 'dont', 'no', 'nahi', 'nahin', 'na'];

// Contrast conjunction regex: split on contrast markers where current feeling comes first
const CONTRAST_REGEX = /\b(but|and\s+want|so\s+want|want\s+something|looking\s+for|need\s+something|wish\s+to|want\s+to\s+watch)\b/i;

/**
 * Classifies mood from text input using rule-based scoring
 * @param {string} text
 * @returns {{ mood: string, confidence: number, matchedKeywords: string[], method: string, uncertain?: boolean, genres: string[] }}
 */
const classifyMoodLocally = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      mood: 'Relaxed',
      confidence: 0.3,
      matchedKeywords: [],
      method: 'rule-based',
      uncertain: true,
      genres: MOOD_GENRES.Relaxed,
    };
  }

  const cleanText = text.toLowerCase().trim();
  if (cleanText.length === 0) {
    return {
      mood: 'Relaxed',
      confidence: 0.3,
      matchedKeywords: [],
      method: 'rule-based',
      uncertain: true,
      genres: MOOD_GENRES.Relaxed,
    };
  }

  // Handle Contrast Pattern: "I feel low and want something uplifting" -> Current feeling (first part) wins!
  let primarySegment = cleanText;
  let secondarySegment = '';
  const contrastMatch = cleanText.match(CONTRAST_REGEX);
  if (contrastMatch && contrastMatch.index > 3) {
    primarySegment = cleanText.slice(0, contrastMatch.index).trim();
    secondarySegment = cleanText.slice(contrastMatch.index).trim();
  }

  const scores = {
    Happy: 0,
    Sad: 0,
    Romantic: 0,
    Angry: 0,
    Excited: 0,
    Relaxed: 0,
    Fearful: 0,
    Motivated: 0,
  };

  const matchedKeywords = [];

  const evaluateSegment = (segmentText, multiplier = 1.0) => {
    const words = segmentText.split(/[\s,.;!?]+/);

    for (const [mood, entries] of Object.entries(MOOD_DICTIONARY)) {
      for (const entry of entries) {
        const phrase = entry.phrase;
        // Check if phrase occurs in the text segment
        if (segmentText.includes(phrase)) {
          // Check for intensifier in the 1-2 words preceding the phrase
          let weight = entry.weight;
          const phraseIdx = segmentText.indexOf(phrase);
          const precedingText = segmentText.slice(Math.max(0, phraseIdx - 20), phraseIdx);
          const hasIntensifier = INTENSIFIERS.some((intWord) =>
            new RegExp(`\\b${intWord}\\b`, 'i').test(precedingText)
          );

          if (hasIntensifier) {
            weight *= 1.6;
          }

          // Check if preceded by negation (e.g. "not feeling good")
          const hasNegation = NEGATION_WORDS.some((negWord) =>
            new RegExp(`\\b${negWord}\\s*$`, 'i').test(precedingText.trim())
          );

          if (hasNegation && entry.weight > 0) {
            // Negated positive/neutral mood -> invert or suppress
            weight = -entry.weight;
          }

          // If entry maps to another mood when negated
          if (entry.mapsTo && weight < 0) {
            scores[entry.mapsTo] += Math.abs(weight) * multiplier;
            matchedKeywords.push(phrase);
          } else {
            scores[mood] += weight * multiplier;
            if (weight > 0) {
              matchedKeywords.push(phrase);
            }
          }
        }
      }
    }
  };

  // Evaluate primary segment with high weight (2.0 if contrast detected)
  const isContrast = !!secondarySegment;
  evaluateSegment(primarySegment, isContrast ? 2.5 : 1.0);
  if (isContrast) {
    // Secondary segment evaluated with minimal weight (0.3)
    evaluateSegment(secondarySegment, 0.3);
  }

  // Find highest scoring mood
  let bestMood = 'Relaxed';
  let maxScore = -Infinity;
  let totalPositiveScore = 0;

  for (const [mood, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestMood = mood;
    }
    if (score > 0) {
      totalPositiveScore += score;
    }
  }

  // If no mood scored positively, return low-confidence default
  if (maxScore <= 0 || matchedKeywords.length === 0) {
    return {
      mood: 'Relaxed',
      confidence: 0.35,
      matchedKeywords: [],
      method: 'rule-based',
      uncertain: true,
      genres: MOOD_GENRES.Relaxed,
    };
  }

  // Calculate normalized confidence score (0.55 to 0.95)
  const scoreDominance = totalPositiveScore > 0 ? maxScore / totalPositiveScore : 0.5;
  const rawConfidence = 0.5 + scoreDominance * 0.45;
  const confidence = Math.min(0.95, Math.max(0.55, Math.round(rawConfidence * 100) / 100));

  return {
    mood: bestMood,
    confidence,
    matchedKeywords: [...new Set(matchedKeywords)],
    method: 'rule-based',
    uncertain: false,
    genres: MOOD_GENRES[bestMood] || [],
  };
};

module.exports = {
  classifyMoodLocally,
  MOOD_DICTIONARY,
};
