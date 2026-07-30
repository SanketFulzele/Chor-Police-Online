import type { GameRole } from "../types";

/**
 * Every possible phase a game round can be in.
 * The game state machine transitions through these in order.
 */
export type GamePhase =
  | "waiting"
  | "shuffling"
  | "card-distribution"
  | "card-reveal"
  | "card-hidden"
  | "waiting-raja"
  | "raja-calling"
  | "mantri-reveal"
  | "guessing"
  | "reveal-roles"
  | "score-update"
  | "leaderboard"
  | "finished";

/**
 * Phase transition rules.
 * Defines which phase can go to which.
 */
export interface PhaseTransition {
  from: GamePhase;
  to: GamePhase[];
}

/**
 * Result of a single round after scoring.
 */
export interface RoundResult {
  roundNumber: number;
  roles: Record<string, GameRole>;
  mantriId: string;
  chosenId: string;
  isCorrect: boolean;
  scores: Record<string, number>;
}

/**
 * Complete state of the game engine at any point.
 */
export interface GameState {
  roomCode: string;
  phase: GamePhase;
  roundNumber: number;
  players: GamePlayer[];
  roleAssignment: RoleDistribution | null;
  mantriId: string | null;
  chosenId: string | null;
  roundHistory: RoundResult[];
  startedAt: number | null;
}

/**
 * Player as seen by the game engine (subset of full Player).
 */
export interface GamePlayer {
  id: string;
  name: string;
  role: GameRole | null;
  hasRevealed: boolean;
  hasHidden: boolean;
  isConnected: boolean;
}

/**
 * Output of the role distributor for one round.
 */
export interface RoleDistribution {
  roundNumber: number;
  assignments: Record<string, GameRole>;
}

/**
 * Per-player role history for fair rotation.
 */
export interface RoleHistory {
  playerId: string;
  roles: GameRole[];
}

/**
 * Final game result (when host ends the game).
 */
export interface GameResult {
  roomCode: string;
  roundsPlayed: number;
  winnerId: string;
  winnerName: string;
  leaderboard: LeaderboardEntry[];
  roundHistory: RoundResult[];
  endedAt: number;
}

/**
 * Single entry in the final leaderboard.
 */
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  roleCounts: Record<GameRole, number>;
}

/**
 * Input for the score calculator.
 */
export interface ScoreInput {
  mantriId: string;
  chosenId: string;
  roles: Record<string, GameRole>;
}

/**
 * Output from the score calculator.
 */
export interface ScoreOutput {
  scores: Record<string, number>;
  isCorrect: boolean;
}

/**
 * Validation rule result.
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}
