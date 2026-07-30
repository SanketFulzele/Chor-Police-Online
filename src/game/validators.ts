import type { GamePhase, GamePlayer, ValidationResult } from "./types";
import { canTransition } from "./gameStateMachine";

/**
 * Central validation for all game actions.
 * Each function returns a ValidationResult with { valid, error?, code? }.
 */

/**
 * Checks if the game can start (called by host).
 * Conditions: exactly 4 players, all connected, all ready.
 */
export function canStartGame(_players: GamePlayer[]): ValidationResult {
  // TODO: Implement in Batch 3
  return { valid: false, error: "Not implemented", code: "NOT_IMPLEMENTED" };
}

/**
 * Checks if a player can reveal their card.
 */
export function canRevealCard(
  _phase: GamePhase,
  _player: GamePlayer
): ValidationResult {
  // TODO: Implement in Batch 3
  return { valid: false, error: "Not implemented", code: "NOT_IMPLEMENTED" };
}

/**
 * Checks if a player can hide their card after revealing.
 */
export function canHideCard(
  _phase: GamePhase,
  _player: GamePlayer
): ValidationResult {
  // TODO: Implement in Batch 3
  return { valid: false, error: "Not implemented", code: "NOT_IMPLEMENTED" };
}

/**
 * Checks if all players have hidden their cards.
 */
export function canProceedFromReveal(
  _players: GamePlayer[]
): ValidationResult {
  // TODO: Implement in Batch 3
  return { valid: false, error: "Not implemented", code: "NOT_IMPLEMENTED" };
}

/**
 * Checks if the Mantri can make a guess.
 */
export function canGuess(
  _phase: GamePhase,
  _playerId: string,
  _mantriId: string
): ValidationResult {
  // TODO: Implement in Batch 4
  return { valid: false, error: "Not implemented", code: "NOT_IMPLEMENTED" };
}

/**
 * Checks if the host can end the round.
 */
export function canEndRound(
  _phase: GamePhase,
  _isHost: boolean
): ValidationResult {
  // TODO: Implement in Batch 4
  return { valid: false, error: "Not implemented", code: "NOT_IMPLEMENTED" };
}

/**
 * Checks if a phase transition is allowed by the state machine.
 */
export function canTransitionPhase(
  current: GamePhase,
  next: GamePhase
): ValidationResult {
  const allowed = canTransition(current, next);
  return allowed
    ? { valid: true }
    : {
        valid: false,
        error: `Cannot transition from ${current} to ${next}`,
        code: "INVALID_TRANSITION",
      };
}
