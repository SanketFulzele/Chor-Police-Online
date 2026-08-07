import type { ScoreInput, ScoreOutput } from "./types";

const RAJA_POINTS = 1000;
const POLICE_CORRECT_POINTS = 500;
const POLICE_WRONG_POINTS = 0;
const SIPAHI_POINTS = 300;
const CHOR_CORRECT_POINTS = 0;
const CHOR_WRONG_POINTS = 500;

export function calculateScores(input: ScoreInput): ScoreOutput {
  const { chosenId, roles } = input;
  const chosenRole = roles[chosenId];

  const isCorrect = chosenRole === "chor";

  const scores: Record<string, number> = {};

  for (const [playerId, role] of Object.entries(roles)) {
    switch (role) {
      case "raja":
        scores[playerId] = RAJA_POINTS;
        break;
      case "police":
        scores[playerId] = isCorrect ? POLICE_CORRECT_POINTS : POLICE_WRONG_POINTS;
        break;
      case "chor":
        scores[playerId] = isCorrect ? CHOR_CORRECT_POINTS : CHOR_WRONG_POINTS;
        break;
      case "sipahi":
        scores[playerId] = SIPAHI_POINTS;
        break;
    }
  }

  return { scores, isCorrect };
}

export function accumulateScores(
  previousScores: Record<string, number>,
  roundScores: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = { ...previousScores };
  for (const [playerId, score] of Object.entries(roundScores)) {
    result[playerId] = (result[playerId] ?? 0) + score;
  }
  return result;
}
