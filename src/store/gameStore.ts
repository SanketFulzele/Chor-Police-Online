import { create } from "zustand";
import type { GameRole, GamePhase } from "../types";

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  score: number;
}

export interface RoundResultData {
  roundNumber: number;
  isCorrect: boolean;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
  mantriId: string;
  chosenId: string;
}

export interface RoundHistoryItem {
  roundNumber: number;
  roles: Record<string, GameRole>;
  mantriId: string;
  chosenId: string;
  isCorrect: boolean;
  scores: Record<string, number>;
}

interface GameState {
  myRole: GameRole | null;
  phase: GamePhase | null;
  round: number;
  rajaId: string | null;
  mantriId: string | null;
  chosenId: string | null;
  chorId: string | null;
  isCorrect: boolean | null;
  leaderboard: LeaderboardEntry[];
  winnerId: string | null;
  winnerName: string | null;
  playerStatistics: Record<string, unknown> | null;
  roundHistory: RoundHistoryItem[];

  setMyRole: (role: GameRole) => void;
  setPhase: (phase: GamePhase) => void;
  setRound: (round: number) => void;
  setRajaId: (id: string | null) => void;
  setMantriId: (id: string | null) => void;
  setSelectionResult: (data: { chosenId: string; chorId: string; isCorrect: boolean }) => void;
  setGameOver: (data: { winnerId: string; winnerName: string; leaderboard: LeaderboardEntry[]; playerStatistics: Record<string, unknown>; roundHistory: RoundHistoryItem[] }) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  myRole: null,
  phase: null,
  round: 0,
  rajaId: null,
  mantriId: null,
  chosenId: null,
  chorId: null,
  isCorrect: null,
  leaderboard: [],
  winnerId: null,
  winnerName: null,
  playerStatistics: null,
  roundHistory: [],

  setMyRole: (role) => set({ myRole: role }),
  setPhase: (phase) => set({ phase }),
  setRound: (round) => set({ round }),
  setRajaId: (id) => set({ rajaId: id }),
  setMantriId: (id) => set({ mantriId: id }),
  setSelectionResult: (data) =>
    set({ chosenId: data.chosenId, chorId: data.chorId, isCorrect: data.isCorrect }),
  setGameOver: (data) =>
    set({
      winnerId: data.winnerId,
      winnerName: data.winnerName,
      leaderboard: data.leaderboard,
      playerStatistics: data.playerStatistics,
      roundHistory: data.roundHistory,
      phase: "finished",
    }),
  reset: () =>
    set({
      myRole: null,
      phase: null,
      round: 0,
      rajaId: null,
      mantriId: null,
      chosenId: null,
      chorId: null,
      isCorrect: null,
      leaderboard: [],
      winnerId: null,
      winnerName: null,
      playerStatistics: null,
      roundHistory: [],
    }),
}));
