const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { classifyMoodLocally } = require('./localMoodClassifier');

describe('Local Mood Classifier (Rule-Based NLP Engine)', () => {
  // Test cases for each of the 8 moods (English)
  test('1. Happy: classifies cheerful, joyful text correctly', () => {
    const res = classifyMoodLocally('I feel fantastic and full of joy today, so happy!');
    assert.equal(res.mood, 'Happy');
    assert.equal(res.method, 'rule-based');
    assert.ok(res.confidence >= 0.55);
    assert.ok(res.genres.includes('Comedy'));
  });

  test('2. Sad: classifies sorrow, lonely, and depressing text correctly', () => {
    const res = classifyMoodLocally('I am feeling so depressed, lonely, and crying inside');
    assert.equal(res.mood, 'Sad');
    assert.equal(res.method, 'rule-based');
    assert.ok(res.genres.includes('Drama'));
  });

  test('3. Romantic: classifies affection, passion, and love text correctly', () => {
    const res = classifyMoodLocally('Looking for romance, passion, and true love with my soulmate');
    assert.equal(res.mood, 'Romantic');
    assert.ok(res.genres.includes('Romance'));
  });

  test('4. Angry: classifies rage, fury, and vengeance text correctly', () => {
    const res = classifyMoodLocally('I am furious and full of rage, want revenge!');
    assert.equal(res.mood, 'Angry');
    assert.ok(res.genres.includes('Action'));
  });

  test('5. Excited: classifies adrenaline, thrilling, and hype text correctly', () => {
    const res = classifyMoodLocally('So thrilled and pumped up for an epic wild adventure!');
    assert.equal(res.mood, 'Excited');
    assert.ok(res.genres.includes('Sci-Fi') || res.genres.includes('Adventure'));
  });

  test('6. Relaxed: classifies calm, peaceful, and chill text correctly', () => {
    const res = classifyMoodLocally('Just want to unwind, stay calm, and chill peacefully with quiet vibes');
    assert.equal(res.mood, 'Relaxed');
    assert.ok(res.genres.includes('Comedy') || res.genres.includes('Family'));
  });

  test('7. Fearful: classifies horror, scary, and terrified text correctly', () => {
    const res = classifyMoodLocally('Terrified by spooky nightmares, eerie haunted house, and scary ghosts');
    assert.equal(res.mood, 'Fearful');
    assert.ok(res.genres.includes('Horror'));
  });

  test('8. Motivated: classifies ambition, hustle, and triumph text correctly', () => {
    const res = classifyMoodLocally('Driven to hustle hard, discipline myself, persevere and achieve success');
    assert.equal(res.mood, 'Motivated');
    assert.ok(res.genres.includes('Biography') || res.genres.includes('Inspirational'));
  });

  // Negation handling
  test('9. Negation: "not happy" correctly inverts to Sad', () => {
    const res = classifyMoodLocally('I am really not happy with everything going on');
    assert.equal(res.mood, 'Sad');
  });

  test('10. Negation: "don\'t feel good" maps to Sad', () => {
    const res = classifyMoodLocally("I don't feel good right now, things are tough");
    assert.equal(res.mood, 'Sad');
  });

  // Hinglish vocabulary support
  test('11. Hinglish Sad: "bohot udaas hu"', () => {
    const res = classifyMoodLocally('Aaj main bohot udaas hu aur dil me dard hai');
    assert.equal(res.mood, 'Sad');
    assert.ok(res.matchedKeywords.some((k) => k.includes('udaas')));
  });

  test('12. Hinglish Happy: "bahut khush hu"', () => {
    const res = classifyMoodLocally('Main bahut khush hu aur bohot maza aa raha hai');
    assert.equal(res.mood, 'Happy');
    assert.ok(res.matchedKeywords.some((k) => k.includes('khush') || k.includes('maza')));
  });

  test('13. Hinglish Angry: "bohot gussa aa raha hai"', () => {
    const res = classifyMoodLocally('Mujhe bohot gussa aa raha hai ladai karne ka man hai');
    assert.equal(res.mood, 'Angry');
    assert.ok(res.matchedKeywords.some((k) => k.includes('gussa')));
  });

  test('14. Hinglish Romantic: "pyaar bhari kahani"', () => {
    const res = classifyMoodLocally('Dil chahta hai koi pyaar bhari kahani dekhu jisme ishq ho');
    assert.equal(res.mood, 'Romantic');
  });

  test('15. Hinglish Fearful: "bohot dar lagta hai bhoot se"', () => {
    const res = classifyMoodLocally('Raat ko akele me bohot dar lagta hai bhoot aur chudail se');
    assert.equal(res.mood, 'Fearful');
  });

  // Contrast sentence handling
  test('16. Contrast: "I feel low and want something uplifting" -> Sad (current feeling wins)', () => {
    const res = classifyMoodLocally('I feel low and want something uplifting');
    assert.equal(res.mood, 'Sad');
    assert.equal(res.uncertain, false);
  });

  test('17. Contrast: "feeling depressed and lonely but looking for a comedy" -> Sad', () => {
    const res = classifyMoodLocally('feeling depressed and lonely but looking for a comedy to watch');
    assert.equal(res.mood, 'Sad');
  });

  // Edge cases: empty, garbage, and very long text
  test('18. Empty/blank text returns Relaxed default with uncertain: true', () => {
    const res = classifyMoodLocally('   ');
    assert.equal(res.mood, 'Relaxed');
    assert.equal(res.uncertain, true);
    assert.ok(res.confidence <= 0.4);
  });

  test('19. Garbage / gibberish text returns uncertain default instead of crashing', () => {
    const res = classifyMoodLocally('asdfghjkl qwertyuiop zxcvbnm 123456');
    assert.equal(res.uncertain, true);
    assert.ok(res.confidence <= 0.4);
  });

  test('20. Long text (up to 500 chars) correctly detected', () => {
    const filler = 'Today was a standard workday with meetings and documentation tasks. ';
    const longText = (filler.repeat(5) + ' At the end of it all, I am so thrilled, pumped up, and excited!').slice(0, 480);
    const res = classifyMoodLocally(longText);
    assert.equal(res.mood, 'Excited');
    assert.equal(res.uncertain, false);
  });
});
