import type { GameRole } from "../../shared/socket/types";
import type { RoundHistoryEntry } from "../../shared/socket/types";
import { emptyRoleCounts } from "./roles";

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  highestScore: number;
  totalScore: number;
  timesRole: Record<GameRole, number>;
  correctGuesses: number;
  wrongGuesses: number;
}

export function calculatePlayerStats(
  playerId: string,
  rounds: RoundHistoryEntry[],
  allWinners: string[]
): PlayerStats {
  let totalScore = 0;
  let highestScore = 0;
  const timesRole = emptyRoleCounts();
  let correctGuesses = 0;
  let wrongGuesses = 0;

  for (const round of rounds) {
    const score = round.scores[playerId] ?? 0;
    totalScore += score;
    if (score > highestScore) highestScore = score;

    const role = round.roles[playerId];
    if (role) timesRole[role]++;

    if (playerId === round.policeId || role === "police") {
      if (round.isCorrect) correctGuesses++;
      else wrongGuesses++;
    }
  }

  const wins = allWinners.filter((w) => w === playerId).length;

  return {
    gamesPlayed: 1,
    wins,
    highestScore,
    totalScore,
    timesRole,
    correctGuesses,
    wrongGuesses,
  };
}

export function countRoles(
  playerId: string,
  rounds: RoundHistoryEntry[]
): Record<GameRole, number> {
  const counts = emptyRoleCounts();
  for (const round of rounds) {
    const role = round.roles[playerId];
    if (role) counts[role]++;
  }
  return counts;
}
