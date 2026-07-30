import type { GameResult, LeaderboardEntry, RoundResult } from "./types";

/**
 * Determines the winner and builds the final leaderboard.
 *
 * The winner is the player with the highest total score.
 *
 * Tie-breaking rules (future):
 * 1. Most correct guesses as Mantri
 * 2. Most times as Raja
 * 3. Random selection (last resort)
 */

/**
 * Builds the final leaderboard from round history.
 */
export function calculateLeaderboard(
  _roundHistory: RoundResult[],
  _playerNames: Record<string, string>
): LeaderboardEntry[] {
  // TODO: Implement in Batch 5
  return [];
}

/**
 * Determines the single winner from the leaderboard.
 */
export function determineWinner(
  leaderboard: LeaderboardEntry[]
): LeaderboardEntry {
  // TODO: Implement in Batch 5
  return leaderboard[0];
}

/**
 * Builds the final GameResult from game data.
 */
export function buildGameResult(
  _roomCode: string,
  _roundHistory: RoundResult[],
  _playerNames: Record<string, string>
): GameResult {
  // TODO: Implement in Batch 5
  throw new Error("Not implemented");
}

/**
 * Checks if there is a tie for first place.
 */
export function hasTie(leaderboard: LeaderboardEntry[]): boolean {
  if (leaderboard.length < 2) return false;
  return leaderboard[0].totalScore === leaderboard[1].totalScore;
}
