import type { ScoreInput, ScoreOutput } from "./types";

const CORRECT_POINTS = 500;
const CHOR_CAUGHT_POINTS = 0;
const CHOR_ESCAPED_POINTS = 500;

export function calculateScores(input: ScoreInput): ScoreOutput {
  const { chosenId, roles } = input;
  const chosenRole = roles[chosenId];
  const isCorrect = chosenRole === "chor";

  const scores: Record<string, number> = {};

  for (const [playerId, role] of Object.entries(roles)) {
    if (isCorrect) {
      if (role === "chor") {
        scores[playerId] = CHOR_CAUGHT_POINTS;
      } else {
        scores[playerId] = CORRECT_POINTS;
      }
    } else {
      if (role === "chor") {
        scores[playerId] = CHOR_ESCAPED_POINTS;
      } else {
        scores[playerId] = 0;
      }
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
