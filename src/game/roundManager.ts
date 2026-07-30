import type { GamePhase, RoundResult } from "./types";

/**
 * Tracks the state of the current and past rounds.
 *
 * Responsibilities (future):
 * - Increment round number when a new round starts
 * - Store completed round results
 * - Track the current game phase
 * - Provide round history for stats and leaderboard
 */

export interface RoundState {
  currentRound: number;
  currentPhase: GamePhase;
  completedRounds: RoundResult[];
}

/**
 * Creates the initial round state for a new game.
 */
export function createRoundState(): RoundState {
  return {
    currentRound: 0,
    currentPhase: "waiting",
    completedRounds: [],
  };
}

/**
 * Advances to the next round.
 */
export function nextRound(state: RoundState): RoundState {
  // TODO: Implement in Batch 3
  return state;
}

/**
 * Records a completed round result.
 */
export function completeRound(
  state: RoundState,
  _result: RoundResult
): RoundState {
  // TODO: Implement in Batch 3
  return state;
}

/**
 * Returns the total number of completed rounds.
 */
export function getTotalRounds(state: RoundState): number {
  return state.completedRounds.length;
}
