import { calculateScore } from '@vibequiz/shared';

describe('calculateScore', () => {
  it('applies base, time bonus and streak multiplier', () => {
    const totalMs = 20000;
    const remainingMs = 10000;
    const streak = 3;
    const score = calculateScore({ totalMs, remainingMs, streak });
    expect(score).toBe(Math.floor((1000 + 250) * 1.2));
  });
});
