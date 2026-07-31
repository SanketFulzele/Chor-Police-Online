export type GameRole = "raja" | "mantri" | "chor" | "sipahi";

export type GamePhase =
  | "waiting"
  | "shuffling"
  | "card-distribution"
  | "card-reveal"
  | "mantri-reveal"
  | "guessing"
  | "reveal-roles"
  | "score-update"
  | "leaderboard"
  | "finished";

export interface PlayerStatistics {
  gamesPlayed: number;
  wins: number;
  highestScore: number;
  totalScore: number;
  timesRaja: number;
  timesMantri: number;
  timesChor: number;
  timesSipahi: number;
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
  isReady: boolean;
  avatarColor: string;
  joinedAt: number;
  roleHistory: GameRole[];
  currentScore: number;
  totalScore: number;
  statistics: PlayerStatistics;
  currentRole?: GameRole;
  publicRole?: GameRole;
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
