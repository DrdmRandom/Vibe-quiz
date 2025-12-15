export interface ScoreInput {
  totalMs: number;
  remainingMs: number;
  streak: number;
}

export function calculateScore({ totalMs, remainingMs, streak }: ScoreInput): number {
  const base = 1000;
  const timeBonus = Math.max(0, Math.min(500, Math.floor((remainingMs / totalMs) * 500)));
  const multiplier = 1 + Math.min(Math.max(streak - 1, 0), 5) * 0.1;
  return Math.floor((base + timeBonus) * multiplier);
}

export function nextStreak(currentStreak: number, isCorrect: boolean): number {
  return isCorrect ? (currentStreak === 0 ? 1 : currentStreak + 1) : 0;
}
