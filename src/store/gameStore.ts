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
  hasRevealed: boolean;
  hasHidden: boolean;
  revealedPlayers: string[];
  hiddenPlayers: string[];
  isShuffling: boolean;
  mantriId: string | null;
  rajaRevealedPlayerId: string | null;
  showResult: { isCorrect: boolean } | null;
  revealedRoles: Record<string, GameRole> | null;
  lastRoundResult: RoundResultData | null;
  currentScores: Record<string, number> | null;
  currentTotals: Record<string, number> | null;
  leaderboard: LeaderboardEntry[];
  winnerId: string | null;
  winnerName: string | null;
  playerStatistics: Record<string, unknown> | null;
  roundHistory: RoundHistoryItem[];

  setMyRole: (role: GameRole) => void;
  setPhase: (phase: GamePhase) => void;
  setRound: (round: number) => void;
  setHasRevealed: (v: boolean) => void;
  setHasHidden: (v: boolean) => void;
  addRevealedPlayer: (playerId: string) => void;
  addHiddenPlayer: (playerId: string) => void;
  setShuffling: (v: boolean) => void;
  setMantriId: (id: string | null) => void;
  setRajaRevealedPlayerId: (id: string | null) => void;
  setShowResult: (result: { isCorrect: boolean } | null) => void;
  setRevealedRoles: (roles: Record<string, GameRole> | null) => void;
  setLastRoundResult: (result: RoundResultData | null) => void;
  setCurrentScores: (s: Record<string, number> | null) => void;
  setCurrentTotals: (t: Record<string, number> | null) => void;
  setLeaderboard: (lb: LeaderboardEntry[]) => void;
  setGameOver: (data: { winnerId: string; winnerName: string; leaderboard: LeaderboardEntry[]; playerStatistics: Record<string, unknown>; roundHistory: RoundHistoryItem[] }) => void;
  resetRound: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  myRole: null,
  phase: null,
  round: 0,
  hasRevealed: false,
  hasHidden: false,
  revealedPlayers: [],
  hiddenPlayers: [],
  isShuffling: false,
  mantriId: null,
  rajaRevealedPlayerId: null,
  showResult: null,
  revealedRoles: null,
  lastRoundResult: null,
  currentScores: null,
  currentTotals: null,
  leaderboard: [],
  winnerId: null,
  winnerName: null,
  playerStatistics: null,
  roundHistory: [],

  setMyRole: (role) => set({ myRole: role }),
  setPhase: (phase) => set({ phase }),
  setRound: (round) => set({ round }),
  setHasRevealed: (v) => set({ hasRevealed: v }),
  setHasHidden: (v) => set({ hasHidden: v }),
  addRevealedPlayer: (playerId) =>
    set((state) => ({
      revealedPlayers: state.revealedPlayers.includes(playerId)
        ? state.revealedPlayers
        : [...state.revealedPlayers, playerId],
    })),
  addHiddenPlayer: (playerId) =>
    set((state) => ({
      hiddenPlayers: state.hiddenPlayers.includes(playerId)
        ? state.hiddenPlayers
        : [...state.hiddenPlayers, playerId],
    })),
  setShuffling: (v) => set({ isShuffling: v }),
  setMantriId: (id) => set({ mantriId: id }),
  setRajaRevealedPlayerId: (id) => set({ rajaRevealedPlayerId: id }),
  setShowResult: (result) => set({ showResult: result }),
  setRevealedRoles: (roles) => set({ revealedRoles: roles }),
  setLastRoundResult: (result) => set({ lastRoundResult: result }),
  setCurrentScores: (s) => set({ currentScores: s }),
  setCurrentTotals: (t) => set({ currentTotals: t }),
  setLeaderboard: (lb) => set({ leaderboard: lb }),
  setGameOver: (data) =>
    set({
      winnerId: data.winnerId,
      winnerName: data.winnerName,
      leaderboard: data.leaderboard,
      playerStatistics: data.playerStatistics,
      roundHistory: data.roundHistory,
      phase: "finished",
    }),

  resetRound: () =>
    set({
      hasRevealed: false,
      hasHidden: false,
      revealedPlayers: [],
      hiddenPlayers: [],
      isShuffling: false,
      mantriId: null,
      rajaRevealedPlayerId: null,
      showResult: null,
      revealedRoles: null,
      lastRoundResult: null,
      currentScores: null,
      currentTotals: null,
      leaderboard: [],
    }),
  reset: () =>
    set({
      myRole: null,
      phase: null,
      round: 0,
      hasRevealed: false,
      hasHidden: false,
      revealedPlayers: [],
      hiddenPlayers: [],
      isShuffling: false,
      mantriId: null,
      rajaRevealedPlayerId: null,
      showResult: null,
      revealedRoles: null,
      lastRoundResult: null,
      currentScores: null,
      currentTotals: null,
      leaderboard: [],
      winnerId: null,
      winnerName: null,
      playerStatistics: null,
      roundHistory: [],
    }),
}));
