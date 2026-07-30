import { create } from "zustand";
import type { GameRole, GamePhase, PlayerStatistics } from "../types";
import type { RoundHistoryEntry } from "../../shared/socket/types";

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  score: number;
}

interface GameState {
  myRole: GameRole | null;
  phase: GamePhase | null;
  rajaId: string | null;
  mantriId: string | null;
  chosenId: string | null;
  chorId: string | null;
  isCorrect: boolean | null;
  leaderboard: LeaderboardEntry[];
  winnerId: string | null;
  winnerName: string | null;
  winnerLabel: string | null;
  playerStatistics: Record<string, PlayerStatistics> | null;
  roundHistory: RoundHistoryEntry[];

  setMyRole: (role: GameRole) => void;
  setPhase: (phase: GamePhase) => void;
  setPhaseData: (data: {
    phase: GamePhase;
    rajaId?: string | null;
    mantriId?: string | null;
    chosenId?: string | null;
    chorId?: string | null;
    isCorrect?: boolean | null;
  }) => void;
  setLeaderboard: (lb: LeaderboardEntry[]) => void;
  setGameOver: (data: {
    winnerId: string;
    winnerName: string;
    winnerLabel: string;
    leaderboard: LeaderboardEntry[];
    playerStatistics: Record<string, PlayerStatistics>;
    roundHistory: RoundHistoryEntry[];
  }) => void;
  reset: () => void;
}

const initialState = {
  myRole: null as GameRole | null,
  phase: null as GamePhase | null,
  rajaId: null as string | null,
  mantriId: null as string | null,
  chosenId: null as string | null,
  chorId: null as string | null,
  isCorrect: null as boolean | null,
  leaderboard: [] as LeaderboardEntry[],
  winnerId: null as string | null,
  winnerName: null as string | null,
  winnerLabel: null as string | null,
  playerStatistics: null as Record<string, PlayerStatistics> | null,
  roundHistory: [] as RoundHistoryEntry[],
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setMyRole: (role) => set({ myRole: role }),
  setPhase: (phase) => set({ phase }),
  setPhaseData: (data) =>
    set({
      phase: data.phase,
      rajaId: data.rajaId ?? null,
      mantriId: data.mantriId ?? null,
      chosenId: data.chosenId ?? null,
      chorId: data.chorId ?? null,
      isCorrect: data.isCorrect ?? null,
    }),
  setLeaderboard: (lb) => set({ leaderboard: lb }),
  setGameOver: (data) =>
    set({
      winnerId: data.winnerId,
      winnerName: data.winnerName,
      winnerLabel: data.winnerLabel,
      leaderboard: data.leaderboard,
      playerStatistics: data.playerStatistics,
      roundHistory: data.roundHistory,
      phase: "finished",
    }),
  reset: () => set({ ...initialState }),
}));
