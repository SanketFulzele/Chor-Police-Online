import type { RoundResult } from "./types";
import type { GameRole } from "../types";

/**
 * Per-player statistics accumulated across games.
 *
 * These are computed from round history and stored
 * in LocalStorage for persistence.
 */

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  highestScore: number;
  totalScore: number;
  timesRaja: number;
  timesMantri: number;
  timesChor: number;
  timesDaku: number;
  correctGuesses: number;
  wrongGuesses: number;
}

/**
 * Calculates a single player's stats from round history.
 */
export function calculatePlayerStats(
  _playerId: string,
  _roundHistory: RoundResult[],
  _allWinners: string[]
): PlayerStats {
  // TODO: Implement in Batch 5
  return {
    gamesPlayed: 0,
    wins: 0,
    highestScore: 0,
    totalScore: 0,
    timesRaja: 0,
    timesMantri: 0,
    timesChor: 0,
    timesDaku: 0,
    correctGuesses: 0,
    wrongGuesses: 0,
  };
}

/**
 * Counts how many times a player received each role.
 */
export function countRoles(
  _playerId: string,
  _roundHistory: RoundResult[]
): Record<GameRole, number> {
  // TODO: Implement in Batch 5
  return { raja: 0, mantri: 0, chor: 0, daku: 0 };
}
