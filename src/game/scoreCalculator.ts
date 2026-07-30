import type { ScoreInput, ScoreOutput } from "./types";

/**
 * SCORING RULES
 *
 * If Mantri correctly identifies Chor:
 *   Raja   +1000
 *   Mantri  +500
 *   Daku    +300
 *   Chor       0
 *
 * If Mantri incorrectly chooses Daku:
 *   Raja   +1000
 *   Mantri     0
 *   Daku    +300
 *   Chor    +500
 */

/**
 * Calculates round scores based on roles and Mantri's choice.
 */
export function calculateScores(_input: ScoreInput): ScoreOutput {
  // TODO: Implement in Batch 4
  throw new Error("Not implemented");
}

/**
 * Accumulates a new round's scores into running totals.
 */
export function accumulateScores(
  previousScores: Record<string, number>,
  _roundScores: Record<string, number>
): Record<string, number> {
  // TODO: Implement in Batch 4
  return previousScores;
}
