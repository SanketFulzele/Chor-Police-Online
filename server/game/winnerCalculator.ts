import type { GameRole } from "../shared/socket/types.js";
import type { RoundHistoryEntry } from "../shared/socket/types.js";

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalScore: number;
  roleCounts: Record<GameRole, number>;
}

export interface GameResult {
  roomCode: string;
  roundsPlayed: number;
  winnerId: string;
  winnerName: string;
  leaderboard: LeaderboardEntry[];
  roundHistory: RoundHistoryEntry[];
  endedAt: number;
}

export function calculateLeaderboard(
  roundHistory: RoundHistoryEntry[],
  playerNames: Record<string, string>
): LeaderboardEntry[] {
  const totals: Record<string, number> = {};
  const roleCounts: Record<string, Record<GameRole, number>> = {};

  for (const round of roundHistory) {
    for (const [playerId, score] of Object.entries(round.scores)) {
      totals[playerId] = (totals[playerId] ?? 0) + score;
    }
    for (const [playerId, role] of Object.entries(round.roles)) {
      if (!roleCounts[playerId]) {
        roleCounts[playerId] = { raja: 0, mantri: 0, chor: 0, police: 0 };
      }
      roleCounts[playerId][role as GameRole]++;
    }
  }

  return Object.entries(totals)
    .map(([playerId, totalScore]) => ({
      playerId,
      playerName: playerNames[playerId] ?? "Unknown",
      totalScore,
      roleCounts: roleCounts[playerId] ?? { raja: 0, mantri: 0, chor: 0, police: 0 },
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
}

export function determineWinner(
  leaderboard: LeaderboardEntry[]
): LeaderboardEntry {
  return leaderboard[0];
}

export function buildGameResult(
  roomCode: string,
  roundHistory: RoundHistoryEntry[],
  playerNames: Record<string, string>
): GameResult {
  const lb = calculateLeaderboard(roundHistory, playerNames);
  const winner = determineWinner(lb);
  return {
    roomCode,
    roundsPlayed: roundHistory.length,
    winnerId: winner.playerId,
    winnerName: winner.playerName,
    leaderboard: lb,
    roundHistory,
    endedAt: Date.now(),
  };
}

export function hasTie(leaderboard: LeaderboardEntry[]): boolean {
  if (leaderboard.length < 2) return false;
  return leaderboard[0].totalScore === leaderboard[1].totalScore;
}
