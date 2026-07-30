import type { GamePhase, PhaseTransition } from "./types";

export const PHASES: GamePhase[] = [
  "waiting",
  "role-assignment",
  "reveal-raja",
  "reveal-mantri",
  "police-selection",
  "reveal-result",
  "finished",
];

export const TRANSITIONS: PhaseTransition[] = [
  { from: "waiting", to: ["role-assignment"] },
  { from: "role-assignment", to: ["reveal-raja"] },
  { from: "reveal-raja", to: ["reveal-mantri"] },
  { from: "reveal-mantri", to: ["police-selection"] },
  { from: "police-selection", to: ["reveal-result"] },
  { from: "reveal-result", to: ["finished"] },
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
