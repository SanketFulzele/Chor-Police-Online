import type { GameRole } from "../types";
import type { RoundHistoryEntry } from "../../shared/socket/types";

export interface PlayerStats {
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
}

export function calculatePlayerStats(
  playerId: string,
  rounds: RoundHistoryEntry[],
  allWinners: string[]
): PlayerStats {
  let totalScore = 0;
  let highestScore = 0;
  let timesRaja = 0;
  let timesMantri = 0;
  let timesChor = 0;
  let timesPolice = 0;
  let correctGuesses = 0;
  let wrongGuesses = 0;

  for (const round of rounds) {
    const score = round.scores[playerId] ?? 0;
    totalScore += score;
    if (score > highestScore) highestScore = score;

    const role = round.roles[playerId];
    if (role === "raja") timesRaja++;
    else if (role === "mantri") timesMantri++;
    else if (role === "chor") timesChor++;
    else if (role === "police") timesPolice++;
  }

  const wins = allWinners.filter((w) => w === playerId).length;

  return {
    gamesPlayed: 1,
    wins,
    highestScore,
    totalScore,
    timesRaja,
    timesMantri,
    timesChor,
    timesPolice,
    correctGuesses,
    wrongGuesses,
  };
}

export function countRoles(
  playerId: string,
  rounds: RoundHistoryEntry[]
): Record<GameRole, number> {
  const counts: Record<GameRole, number> = { raja: 0, mantri: 0, chor: 0, police: 0 };
  for (const round of rounds) {
    const role: GameRole | undefined = round.roles[playerId];
    if (role) counts[role]++;
  }
  return counts;
}
