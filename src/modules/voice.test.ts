import { getRandomPrompt, getAllPrompts } from './voice';

describe('getRandomPrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = getRandomPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('returns a value from the known prompts list', () => {
    const all = getAllPrompts();
    const prompt = getRandomPrompt();
    expect(all).toContain(prompt);
  });

  it('does not always return the same prompt (randomness check)', () => {
    const results = new Set(Array.from({ length: 50 }, () => getRandomPrompt()));
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('getAllPrompts', () => {
  it('returns a non-empty array', () => {
    const all = getAllPrompts();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });

  it('returns a copy — mutations do not affect the source', () => {
    const a = getAllPrompts();
    a.push('injected');
    const b = getAllPrompts();
    expect(b).not.toContain('injected');
  });

  it('every prompt is a non-empty string', () => {
    getAllPrompts().forEach((p) => {
      expect(typeof p).toBe('string');
      expect(p.length).toBeGreaterThan(0);
    });
  });
});
