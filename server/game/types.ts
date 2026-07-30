import type { GameRole } from "../shared/socket/types.js";

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

export interface PhaseTransition {
  from: GamePhase;
  to: GamePhase[];
}

export interface RoundResult {
  roundNumber: number;
  roles: Record<string, GameRole>;
  mantriId: string;
  chosenId: string;
  isCorrect: boolean;
  scores: Record<string, number>;
}

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

export interface GamePlayer {
  id: string;
  name: string;
  role: GameRole | null;
  hasRevealed: boolean;
  hasHidden: boolean;
  isConnected: boolean;
}

export interface RoleDistribution {
  roundNumber: number;
  assignments: Record<string, GameRole>;
}

export interface RoleHistory {
  playerId: string;
  roles: GameRole[];
}

export interface GameResult {
  roomCode: string;
  roundsPlayed: number;
  winnerId: string;
  winnerName: string;
  leaderboard: LeaderboardEntry[];
  roundHistory: RoundResult[];
  endedAt: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  roleCounts: Record<GameRole, number>;
}

export interface ScoreInput {
  mantriId: string;
  chosenId: string;
  roles: Record<string, GameRole>;
}

export interface ScoreOutput {
  scores: Record<string, number>;
  isCorrect: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}
