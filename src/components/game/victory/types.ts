import type { GameRole } from "../../../types";
import { ALL_ROLES } from "../../../game/roles";

export interface RoundRow {
  n: number;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
  isCorrect: boolean;
}

export interface RankedPlayer {
  id: string;
  name: string;
  avatarColor: string;
  total: number;
}

export interface StatsShape {
  gamesPlayed: number;
  wins: number;
  highestScore: number;
  totalScore: number;
  timesRole: Record<GameRole, number>;
  correctGuesses: number;
  wrongGuesses: number;
}

type HistoryLike = {
  roundNumber?: number;
  round?: number;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
  isCorrect?: boolean;
};

export function toRows(rh: HistoryLike[]): RoundRow[] {
  return rh.map((r) => ({
    n: r.roundNumber ?? r.round ?? 0,
    scores: r.scores,
    roles: r.roles,
    isCorrect: r.isCorrect ?? true,
  }));
}

export function toStats(raw: unknown): StatsShape | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  const rawTimesRole = r.timesRole as Record<string, unknown> | undefined;
  const timesRole = {} as Record<GameRole, number>;
  for (const role of ALL_ROLES) timesRole[role] = num(rawTimesRole?.[role]);
  return {
    gamesPlayed: num(r.gamesPlayed),
    wins: num(r.wins),
    highestScore: num(r.highestScore),
    totalScore: num(r.totalScore),
    timesRole,
    correctGuesses: num(r.correctGuesses),
    wrongGuesses: num(r.wrongGuesses),
  };
}

type RankablePlayer = { id: string; name: string; avatarColor: string };

export function rankPlayers(
  players: RankablePlayer[],
  currentTotals: Record<string, number> | null,
  rows: RoundRow[]
): RankedPlayer[] {
  return [...players]
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarColor: p.avatarColor,
      total: currentTotals?.[p.id] ?? rows.reduce((sum, r) => sum + (r.scores[p.id] ?? 0), 0),
    }))
    .sort((a, b) => b.total - a.total);
}

export function placeLabel(i: number): string {
  if (i === 0) return "1st Place";
  if (i === 1) return "2nd Place";
  if (i === 2) return "3rd Place";
  return `${i + 1}th Place`;
}
