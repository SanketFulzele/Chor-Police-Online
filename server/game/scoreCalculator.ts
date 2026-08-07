import type { ScoreInput, ScoreOutput } from "./types";
import type { GameRole } from "../shared/socket/types.js";

const ROLE_POINTS: Record<GameRole, number> = {
  raja: 1000,
  police: 800,
  sipahi: 600,
  chor: 0,
  daku: 200,
  joker: 300,
  "aam-aadmi": 100,
  jasoos: 400,
};

const POLICE_WRONG_POINTS = 0;
const CHOR_ESCAPE_POINTS = 800;

export function calculateScores(input: ScoreInput): ScoreOutput {
  const { chosenId, roles } = input;

  const isCorrect = roles[chosenId] === "chor";

  const scores: Record<string, number> = {};

  for (const [playerId, role] of Object.entries(roles)) {
    let points = ROLE_POINTS[role] ?? 0;
    if (role === "police" && !isCorrect) points = POLICE_WRONG_POINTS;
    if (role === "chor" && !isCorrect) points = CHOR_ESCAPE_POINTS;
    scores[playerId] = points;
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
