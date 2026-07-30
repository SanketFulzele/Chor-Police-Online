import type { GameRole, GamePhase, Player, PlayerStatistics, Room } from "../../shared/socket/types";

export type { GameRole, GamePhase, Player, PlayerStatistics, Room };

export interface RoundRecord {
  round: number;
  roles: Record<string, GameRole>;
  mantriId: string;
  chosenId: string;
  correct: boolean;
  scores: Record<string, number>;
}

export interface StoredGame {
  id: string;
  date: string;
  winnerId: string;
  winnerName: string;
  roundsPlayed: number;
  players: { id: string; name: string; score: number }[];
  roundHistory: RoundRecord[];
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected";
