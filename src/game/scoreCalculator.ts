import type { ScoreInput, ScoreOutput } from "./types";

export function calculateScores(input: ScoreInput): ScoreOutput {
  const { chosenId, roles } = input;
  const chosenRole = roles[chosenId];
  const isCorrect = chosenRole === "chor";

  const scores: Record<string, number> = {};

  for (const [playerId, role] of Object.entries(roles)) {
    switch (role) {
      case "raja":
      case "mantri":
      case "police":
        scores[playerId] = isCorrect ? 500 : 0;
        break;
      case "chor":
        scores[playerId] = isCorrect ? 0 : 500;
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
