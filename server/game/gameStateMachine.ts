import type { GamePhase, PhaseTransition } from "./types";

export const PHASES: GamePhase[] = [
  "waiting",
  "shuffling",
  "card-distribution",
  "card-reveal",
  "waiting-raja",
  "raja-calling",
  "mantri-reveal",
  "guessing",
  "reveal-roles",
  "score-update",
  "leaderboard",
  "finished",
];

export const TRANSITIONS: PhaseTransition[] = [
  { from: "waiting", to: ["shuffling"] },
  { from: "shuffling", to: ["card-distribution"] },
  { from: "card-distribution", to: ["card-reveal"] },
  { from: "card-reveal", to: ["waiting-raja"] },
  { from: "waiting-raja", to: ["raja-calling"] },
  { from: "raja-calling", to: ["mantri-reveal"] },
  { from: "mantri-reveal", to: ["guessing"] },
  { from: "guessing", to: ["reveal-roles"] },
  { from: "reveal-roles", to: ["score-update"] },
  { from: "score-update", to: ["leaderboard"] },
  { from: "leaderboard", to: ["shuffling", "finished"] },
  { from: "finished", to: [] },
];

export function getNextPhase(current: GamePhase): GamePhase | null {
  const t = TRANSITIONS.find((x) => x.from === current);
  if (!t || t.to.length === 0) return null;
  return t.to[0];
}

export function getLegalTransitions(current: GamePhase): GamePhase[] {
  return TRANSITIONS.find((x) => x.from === current)?.to ?? [];
}

export function canTransition(current: GamePhase, next: GamePhase): boolean {
  return getLegalTransitions(current).includes(next);
}
