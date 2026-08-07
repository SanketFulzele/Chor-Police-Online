import type { GameRole, GamePhase, Player, PlayerStatistics, Room, ChatMessage } from "../../shared/socket/types";

export type { GameRole, GamePhase, Player, PlayerStatistics, Room, ChatMessage };

export interface RoundRecord {
  round: number;
  roles: Record<string, GameRole>;
  policeId: string;
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
