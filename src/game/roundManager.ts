import type { GamePhase, RoundResult } from "./types";

export interface RoundState {
  currentRound: number;
  currentPhase: GamePhase;
  completedRounds: RoundResult[];
}

export function createRoundState(): RoundState {
  return {
    currentRound: 0,
    currentPhase: "waiting",
    completedRounds: [],
  };
}

export function nextRound(state: RoundState): RoundState {
  return {
    ...state,
    currentRound: state.currentRound + 1,
    currentPhase: "shuffling",
  };
}

export function setPhase(
  state: RoundState,
  phase: GamePhase
): RoundState {
  return { ...state, currentPhase: phase };
}

export function completeRound(
  state: RoundState,
  result: RoundResult
): RoundState {
  return {
    ...state,
    completedRounds: [...state.completedRounds, result],
  };
}

export function getTotalRounds(state: RoundState): number {
  return state.completedRounds.length;
}
