export type GameRole = "raja" | "mantri" | "chor" | "police";

export type GamePhase =
  | "waiting"
  | "role-assignment"
  | "reveal-raja"
  | "reveal-mantri"
  | "police-selection"
  | "reveal-result"
  | "finished";

export interface PlayerStatistics {
  gamesPlayed: number;
  wins: number;
  highestScore: number;
  totalScore: number;
  timesRaja: number;
  timesMantri: number;
  timesChor: number;
  timesPolice: number;
  correctGuesses: number;
  wrongGuesses: number;
  averageScore: number;
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  avatarColor: string;
  joinedAt: number;
  roleHistory: GameRole[];
  currentScore: number;
  totalScore: number;
  statistics: PlayerStatistics;
  currentRole?: GameRole;
  hasRevealed: boolean;
  hasHidden: boolean;
}

export interface RoundHistoryEntry {
  roundNumber: number;
  roles: Record<string, GameRole>;
  mantriId: string;
  chosenId: string;
  isCorrect: boolean;
  scores: Record<string, number>;
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  phase: GamePhase;
  round: number;
  createdAt: number;
  mantriId?: string;
  winnerId?: string;
  winnerName?: string;
  finishedAt?: number;
  roundHistory: RoundHistoryEntry[];
}
