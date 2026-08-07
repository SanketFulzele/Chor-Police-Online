import type { GameRole } from "../shared/socket/types.js";
import type { RoundHistoryEntry } from "../shared/socket/types.js";

export interface PlayerStats {
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

export function calculatePlayerStats(
  playerId: string,
  rounds: RoundHistoryEntry[],
  allWinners: string[]
): PlayerStats {
  let totalScore = 0;
  let highestScore = 0;
  let timesRaja = 0;
  let timesPolice = 0;
  let timesChor = 0;
  let timesSipahi = 0;
  let correctGuesses = 0;
  let wrongGuesses = 0;

  for (const round of rounds) {
    const score = round.scores[playerId] ?? 0;
    totalScore += score;
    if (score > highestScore) highestScore = score;

    const role = round.roles[playerId];
    if (role === "raja") timesRaja++;
    else if (role === "police") timesPolice++;
    else if (role === "chor") timesChor++;
    else if (role === "sipahi") timesSipahi++;

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
    timesRaja,
    timesPolice,
    timesChor,
    timesSipahi,
    correctGuesses,
    wrongGuesses,
  };
}

export function countRoles(
  playerId: string,
  rounds: RoundHistoryEntry[]
): Record<GameRole, number> {
  const counts: Record<GameRole, number> = { raja: 0, police: 0, chor: 0, sipahi: 0 };
  for (const round of rounds) {
    const role = round.roles[playerId];
    if (role) counts[role]++;
  }
  return counts;
}
