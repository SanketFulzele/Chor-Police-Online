import type { GamePhase, PhaseTransition } from "./types";

/**
 * All valid game phases in execution order.
 * The state machine transitions through these sequentially every round.
 *
 *    waiting
 *       ↓
 *   shuffling
 *       ↓
 *   card-distribution
 *       ↓
 *    card-reveal
 *       ↓
 *   card-hidden
 *       ↓
 *   raja-calling
 *       ↓
 *   mantri-reveal
 *       ↓
 *    guessing
 *       ↓
 *   reveal-roles
 *       ↓
 *   score-update
 *       ↓
 *   leaderboard
 *       ↓
 *   (next round → shuffling)  or  finished
 */

export const PHASES: GamePhase[] = [
  "waiting",
  "shuffling",
  "card-distribution",
  "card-reveal",
  "card-hidden",
  "raja-calling",
  "mantri-reveal",
  "guessing",
  "reveal-roles",
  "score-update",
  "leaderboard",
  "finished",
];

/**
 * Legal transitions from each phase.
 */
export const TRANSITIONS: PhaseTransition[] = [
  { from: "waiting", to: ["shuffling"] },
  { from: "shuffling", to: ["card-distribution"] },
  { from: "card-distribution", to: ["card-reveal"] },
  { from: "card-reveal", to: ["card-hidden"] },
  { from: "card-hidden", to: ["raja-calling"] },
  { from: "raja-calling", to: ["mantri-reveal"] },
  { from: "mantri-reveal", to: ["guessing"] },
  { from: "guessing", to: ["reveal-roles"] },
  { from: "reveal-roles", to: ["score-update"] },
  { from: "score-update", to: ["leaderboard"] },
  { from: "leaderboard", to: ["shuffling", "finished"] },
  { from: "finished", to: [] },
];

/**
 * Returns the next legal phase after the given one.
 */
export function getNextPhase(current: GamePhase): GamePhase | null {
  const transition = TRANSITIONS.find((t) => t.from === current);
  if (!transition || transition.to.length === 0) return null;
  return transition.to[0];
}

/**
 * Returns all legal target phases from a given phase.
 */
export function getLegalTransitions(current: GamePhase): GamePhase[] {
  const transition = TRANSITIONS.find((t) => t.from === current);
  return transition?.to ?? [];
}

/**
 * Checks whether moving from `current` to `next` is a legal transition.
 */
export function canTransition(current: GamePhase, next: GamePhase): boolean {
  const transition = TRANSITIONS.find((t) => t.from === current);
  return transition?.to.includes(next) ?? false;
}
