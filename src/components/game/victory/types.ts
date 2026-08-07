import type { GameRole } from "../../../types";

export interface RoundRow {
  n: number;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
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
  timesRaja: number;
  timesPolice: number;
  timesChor: number;
  timesSipahi: number;
  correctGuesses: number;
  wrongGuesses: number;
}

type HistoryLike = {
  roundNumber?: number;
  round?: number;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
};

export function toRows(rh: HistoryLike[]): RoundRow[] {
  return rh.map((r) => ({ n: r.roundNumber ?? r.round ?? 0, scores: r.scores, roles: r.roles }));
}

export function toStats(raw: Record<string, unknown> | undefined): StatsShape | null {
  if (!raw) return null;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  return {
    gamesPlayed: num(raw.gamesPlayed),
    wins: num(raw.wins),
    highestScore: num(raw.highestScore),
    totalScore: num(raw.totalScore),
    timesRaja: num(raw.timesRaja),
    timesPolice: num(raw.timesPolice),
    timesChor: num(raw.timesChor),
    timesSipahi: num(raw.timesSipahi),
    correctGuesses: num(raw.correctGuesses),
    wrongGuesses: num(raw.wrongGuesses),
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
