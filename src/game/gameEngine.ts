import type { GameRole, GamePhase } from "../types";
import { canTransition } from "./gameStateMachine";
import { distributeRoles } from "./roleDistributor";
import type { RoleHistory } from "./types";
import { calculateScores } from "./scoreCalculator";

export interface RoundState {
  round: number;
  phase: GamePhase;
  roles: Record<string, GameRole>;
  mantriId: string | null;
  chosenId: string | null;
  isCorrect: boolean | null;
  roundHistory: {
    roundNumber: number;
    roles: Record<string, GameRole>;
    mantriId: string;
    chosenId: string;
    isCorrect: boolean;
    scores: Record<string, number>;
  }[];
  scores: Record<string, number>;
  totals: Record<string, number>;
}

export function createInitialState(): RoundState {
  return {
    round: 0,
    phase: "waiting",
    roles: {},
    mantriId: null,
    chosenId: null,
    isCorrect: null,
    roundHistory: [],
    scores: {},
    totals: {},
  };
}

export function startNewRound(
  state: RoundState,
  playerIds: string[],
  roleHistory: RoleHistory[]
): { state: RoundState; assignments: Record<string, GameRole> } {
  const roundIndex = state.round;
  const distribution = distributeRoles(playerIds, roleHistory, roundIndex);

  return {
    state: {
      ...state,
      phase: "role-assignment",
      roles: distribution.assignments,
    },
    assignments: distribution.assignments,
  };
}

export function advancePhase(
  state: RoundState,
  nextPhase: GamePhase
): RoundState {
  if (!canTransition(state.phase, nextPhase)) {
    return state;
  }
  return { ...state, phase: nextPhase };
}

export function completePoliceSelection(
  state: RoundState,
  chosenId: string
): {
  state: RoundState;
  isCorrect: boolean;
  scores: Record<string, number>;
} {
  const { scores, isCorrect } = calculateScores({
    chosenId,
    roles: state.roles,
  });

  const newTotals: Record<string, number> = { ...state.totals };
  for (const [pid, score] of Object.entries(scores)) {
    newTotals[pid] = (newTotals[pid] ?? 0) + score;
  }

  const mantriId = Object.entries(state.roles).find(
    ([_, role]) => role === "mantri"
  )?.[0] ?? "";

  return {
    state: {
      ...state,
      phase: "reveal-result",
      chosenId,
      isCorrect,
      scores,
      totals: newTotals,
      mantriId,
    },
    isCorrect,
    scores,
  };
}

export function endGameRound(
  state: RoundState
): RoundState {
  const mantriId = Object.entries(state.roles).find(
    ([_, role]) => role === "mantri"
  )?.[0] ?? "";

  const roundResult = {
    roundNumber: state.round,
    roles: state.roles,
    mantriId,
    chosenId: state.chosenId ?? "",
    isCorrect: state.isCorrect ?? false,
    scores: state.scores,
  };

  return {
    ...state,
    phase: "finished",
    roundHistory: [...state.roundHistory, roundResult],
  };
}
