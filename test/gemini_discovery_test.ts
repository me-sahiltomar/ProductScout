import { scoreGeminiModel, FALLBACK_GEMINI_MODELS } from '../src/lib/engine/geminiModelDiscovery';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`[FAIL] ${msg}`);
    process.exit(1);
  }
  console.log(`[PASS] ${msg}`);
}

console.log('========================================================');
console.log('GEMINI DYNAMIC MODEL DISCOVERY & SCORING TESTS');
console.log('========================================================\n');

// 1. Verify Fallback Models
assert(FALLBACK_GEMINI_MODELS[0].id === 'gemini-3.8-flash', 'gemini-3.8-flash is the top recommended fallback model');
assert(FALLBACK_GEMINI_MODELS[0].isRecommended === true, 'gemini-3.8-flash is flagged as isRecommended');
assert(Boolean(FALLBACK_GEMINI_MODELS[0].badge?.includes('Recommended')), 'gemini-3.8-flash has Recommended badge');

// 2. Score Comparisons
const score38Flash = scoreGeminiModel('gemini-3.8-flash');
const score38Pro = scoreGeminiModel('gemini-3.8-pro');
const score25Flash = scoreGeminiModel('gemini-2.5-flash');
const score25Pro = scoreGeminiModel('gemini-2.5-pro');
const score20Flash = scoreGeminiModel('gemini-2.0-flash');
const score15Flash = scoreGeminiModel('gemini-1.5-flash');
const score15Pro = scoreGeminiModel('gemini-1.5-pro');

assert(score38Flash > score38Pro, 'gemini-3.8-flash outscores gemini-3.8-pro for speed & efficiency');
assert(score38Flash > score25Flash, 'gemini-3.8-flash outscores gemini-2.5-flash');
assert(score25Flash > score20Flash, 'gemini-2.5-flash outscores gemini-2.0-flash');
assert(score20Flash > score15Flash, 'gemini-2.0-flash outscores gemini-1.5-flash');
assert(score15Flash > score15Pro, 'gemini-1.5-flash outscores gemini-1.5-pro for quickness');

// 3. Simulated Model List Sorting
const mockRawModels = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-pro',
  'gemini-3.8-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
];

const sorted = mockRawModels.sort((a, b) => scoreGeminiModel(b) - scoreGeminiModel(a));
assert(sorted[0] === 'gemini-3.8-flash', 'Sorting places gemini-3.8-flash at index 0');
assert(sorted[1] === 'gemini-2.5-flash', 'Second place is gemini-2.5-flash');

// 4. Future Model Auto-Ranking
const futureScore = scoreGeminiModel('gemini-4.0-flash');
assert(futureScore > score38Flash, 'Future gemini-4.0-flash automatically outscores gemini-3.8-flash and becomes #1');

console.log('\n========================================================');
console.log('✓ ALL GEMINI MODEL DISCOVERY TESTS PASSED!');
console.log('========================================================');
