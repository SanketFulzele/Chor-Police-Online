import type { GamePhase, GameState, RoundResult } from "./types";
import { getNextPhase } from "./gameStateMachine";

/**
 * GameEngine — the central orchestrator for all gameplay.
 *
 * This module will eventually be called by:
 *   - Socket.IO event handlers (server)
 *   - Game store (client, for read-only state)
 *
 * It must NOT depend on React, Socket.IO, or Express.
 * It is a pure TypeScript module containing all game rules.
 *
 * Future responsibilities:
 *   - Start a new round
 *   - Execute phase transitions
 *   - Coordinate role distribution → reveal → guessing → scoring
 *   - End the game and produce final results
 */

/**
 * Creates the initial game state when a game starts.
 */
export function createGameState(roomCode: string): GameState {
  return {
    roomCode,
    phase: "shuffling",
    roundNumber: 1,
    players: [],
    roleAssignment: null,
    mantriId: null,
    chosenId: null,
    roundHistory: [],
    startedAt: Date.now(),
  };
}

/**
 * Advances the game to the next phase.
 * Returns the new phase or null if no valid transition exists.
 */
export function advancePhase(state: GameState): GamePhase | null {
  const next = getNextPhase(state.phase);
  if (!next) return null;
  return next;
}

/**
 * Prepares the next round (increments counter, resets phase).
 */
export function startNextRound(state: GameState): GameState {
  // TODO: Implement in Batch 3
  return {
    ...state,
    roundNumber: state.roundNumber + 1,
    phase: "shuffling",
    roleAssignment: null,
    mantriId: null,
    chosenId: null,
  };
}

/**
 * Records a completed round result.
 */
export function recordRoundResult(
  state: GameState,
  result: RoundResult
): GameState {
  // TODO: Implement in Batch 4
  return {
    ...state,
    roundHistory: [...state.roundHistory, result],
  };
}
