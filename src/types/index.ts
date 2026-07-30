export type GameRole = "raja" | "mantri" | "chor" | "daku";

export type GamePhase =
  | "waiting"
  | "shuffling"
  | "reveal"
  | "mantri-call"
  | "mantri-reveal"
  | "mantri-choice"
  | "result"
  | "finished";

export interface PlayerStatistics {
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
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  phase: GamePhase;
  round: number;
  createdAt: number;
}

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
