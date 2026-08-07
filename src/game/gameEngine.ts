import type { Room, Player, GameRole, GamePhase } from "../../shared/socket/types";
import { SocketEvents } from "../../shared/socket/events";
import { canTransition } from "./gameStateMachine";
import { distributeRoles } from "./roleDistributor";
import type { RoleHistory } from "./types";
import { calculateScores } from "./scoreCalculator";
import { buildGameResult } from "./winnerCalculator";
import { calculatePlayerStats } from "./statisticsManager";
import { ALL_ROLES, emptyRoleCounts, MAX_PLAYERS, MIN_PLAYERS } from "./roles";

// ---- Types ----

export interface EngineEvent {
  event: string;
  payload: Record<string, unknown>;
}

export interface TargetedEvent extends EngineEvent {
  playerId: string;
}

export interface ScheduledEvent {
  delay: number;
  fromPhase: GamePhase;
  phase: GamePhase;
  events: EngineEvent[];
}

export interface EngineResult {
  ok: boolean;
  error?: { message: string; code: string };
  events: EngineEvent[];
  targetedEvents: TargetedEvent[];
  schedule?: ScheduledEvent[];
}

// ---- Phase durations (match current server behaviour exactly) ----

const PHASE_DELAYS: Partial<Record<GamePhase, number>> = {
  shuffling: 2500,
  "police-reveal": 2000,
  "reveal-roles": 3000,
  "score-update": 2000,
};

// ---- Helpers ----

function getRoleMap(room: Room): Record<string, GameRole> {
  const map: Record<string, GameRole> = {};
  for (const p of room.players) {
    if (p.currentRole) map[p.id] = p.currentRole;
  }
  return map;
}

function roleHistoryList(room: Room): RoleHistory[] {
  return room.players.map((p) => ({
    playerId: p.id,
    roles: [...p.roleHistory],
  }));
}

// ---- Validation helpers ----

function invalid(msg: string, code: string): EngineResult {
  return { ok: false, error: { message: msg, code }, events: [], targetedEvents: [] };
}

function validateHost(_room: Room, player: Player): EngineResult | null {
  if (!player.isHost) {
    return invalid("Only the host can do that", "NOT_HOST");
  }
  return null;
}

function validatePhase(room: Room, expected: GamePhase): EngineResult | null {
  if (room.phase !== expected) {
    return invalid("Wrong phase", "WRONG_PHASE");
  }
  return null;
}

// ---- Public API ----

/**
 * Start the game (host action).
 * Transitions: waiting → shuffling → (after delay) card-distribution → card-reveal
 */
export function startGame(room: Room, player: Player): EngineResult {
  const hostErr = validateHost(room, player);
  if (hostErr) return hostErr;

  if (
    room.players.length < MIN_PLAYERS ||
    room.players.length > MAX_PLAYERS ||
    !room.players.every((p) => p.isReady || p.isHost)
  ) {
    return invalid(`Need ${MIN_PLAYERS}-${MAX_PLAYERS} players, all ready`, "INVALID_STATE");
  }

  for (const p of room.players) {
    p.currentRole = undefined;
    p.publicRole = undefined;
    p.hasRevealed = false;
    p.hasHidden = false;
  }

  room.phase = "shuffling";
  room.round = 1;

  const events: EngineEvent[] = [
    { event: SocketEvents.GAME_STARTING, payload: {} },
  ];

  const schedule: ScheduledEvent[] = [
    {
      delay: PHASE_DELAYS.shuffling!,
      fromPhase: "shuffling",
      phase: "card-distribution",
      events: [],
    },
  ];

  return { ok: true, events, targetedEvents: [], schedule };
}

/**
 * Distribute roles after shuffling animation.
 * Called by the handler when the shuffling → card-distribution scheduled event fires.
 */
/**
 * Distribute roles and advance through card-distribution → card-reveal.
 * Called internally by advanceToPhase when transitioning out of shuffling.
 */
function distributeAndDeal(room: Room): EngineResult {
  const playerIds = room.players.map((p) => p.id);
  const roleHist = roleHistoryList(room);
  const roundIndex = Math.max(0, room.round - 1);
  const distribution = distributeRoles(playerIds, roleHist, roundIndex);

  for (const p of room.players) {
    p.currentRole = distribution.assignments[p.id];
    p.roleHistory.push(distribution.assignments[p.id]);
    p.publicRole = undefined;
    p.hasRevealed = false;
    p.hasHidden = false;
  }

  room.phase = "card-distribution";

  const targetedEvents: TargetedEvent[] = [];
  for (const p of room.players) {
    targetedEvents.push({
      event: SocketEvents.CARDS_DISTRIBUTED,
      payload: { role: p.currentRole, phase: "card-distribution" },
      playerId: p.id,
    });
  }

  const schedule: ScheduledEvent[] = [
    {
      delay: 0,
      fromPhase: "card-distribution",
      phase: "card-reveal",
      events: [{ event: SocketEvents.PHASE_CHANGED, payload: { phase: "card-reveal" } }],
    },
  ];

  return { ok: true, events: [], targetedEvents, schedule };
}

/**
 * Player reveals their card during card-reveal phase.
 * If Raja reveals for the first time, broadcast their identity.
 */
export function revealCard(room: Room, player: Player): EngineResult {
  const phaseErr = validatePhase(room, "card-reveal");
  if (phaseErr) return phaseErr;

  if (player.hasHidden) {
    return invalid("Card already hidden", "ALREADY_HIDDEN");
  }

  const isFirstReveal = !player.hasRevealed;
  player.hasRevealed = true;

  const events: EngineEvent[] = [
    { event: SocketEvents.CARD_REVEALED, payload: { playerId: player.id } },
  ];

  // If Raja reveals for the first time, set public role and broadcast
  if (player.currentRole === "raja" && isFirstReveal) {
    player.publicRole = "raja";
    events.push({ event: SocketEvents.RAJA_REVEALED, payload: { playerId: player.id } });
  }

  return {
    ok: true,
    events,
    targetedEvents: [],
  };
}

/**
 * Player hides their card during card-reveal phase.
 * No auto-transition — players can toggle card visibility freely.
 */
export function hideCard(room: Room, player: Player): EngineResult {
  const phaseErr = validatePhase(room, "card-reveal");
  if (phaseErr) return phaseErr;

  if (!player.hasRevealed) {
    return invalid("Card not revealed yet", "NOT_REVEALED");
  }
  if (player.hasHidden) {
    return invalid("Card already hidden", "ALREADY_HIDDEN");
  }

  player.hasHidden = true;

  return {
    ok: true,
    events: [{ event: SocketEvents.CARD_HIDDEN, payload: { playerId: player.id } }],
    targetedEvents: [],
  };
}

/**
 * Raja clicks "Call the Police" — reveals the Police to everyone.
 */
export function callPolice(room: Room, player: Player, _chosenId?: string): EngineResult {
  const phaseErr = validatePhase(room, "card-reveal");
  if (phaseErr) return phaseErr;

  if (player.currentRole !== "raja") {
    return invalid("Only the Raja can call the Police", "NOT_RAJA");
  }

  const police = room.players.find((p) => p.currentRole === "police");
  if (!police) {
    return invalid("Police not found", "POLICE_NOT_FOUND");
  }
  if (!police.isConnected) {
    return invalid("Police disconnected", "POLICE_DISCONNECTED");
  }

  police.publicRole = "police";
  room.policeId = police.id;
  room.phase = "police-reveal";

  const events: EngineEvent[] = [
    { event: SocketEvents.PHASE_CHANGED, payload: { phase: "police-reveal" } },
    { event: SocketEvents.POLICE_REVEALED, payload: { policeId: police.id } },
  ];

  const schedule: ScheduledEvent[] = [
    {
      delay: PHASE_DELAYS["police-reveal"]!,
      fromPhase: "police-reveal",
      phase: "guessing",
      events: [{ event: SocketEvents.PHASE_CHANGED, payload: { phase: "guessing" } }],
    },
  ];

  return { ok: true, events, targetedEvents: [], schedule };
}

/**
 * Police submits their guess for who the Chor is.
 * Calculates scores, transitions through reveal-roles → score-update → leaderboard.
 */
export function submitGuess(room: Room, player: Player, chosenId: string): EngineResult {
  const phaseErr = validatePhase(room, "guessing");
  if (phaseErr) return phaseErr;

  if (player.currentRole !== "police") {
    return invalid("Only the Police can guess", "NOT_POLICE");
  }

  const target = room.players.find((p) => p.id === chosenId);
  if (!target) {
    return invalid("Invalid player", "INVALID_TARGET");
  }
  if (target.currentRole === "raja" || target.currentRole === "police") {
    return invalid("Cannot guess Raja or Police", "INVALID_TARGET");
  }
  if (!target.isConnected) {
    return invalid("Player disconnected", "TARGET_DISCONNECTED");
  }

  const roles = getRoleMap(room);
  const { scores, isCorrect } = calculateScores({ policeId: room.policeId!, chosenId, roles });

  for (const p of room.players) {
    p.currentScore = scores[p.id] ?? 0;
    p.totalScore += p.currentScore;
  }

  room.roundHistory.push({
    roundNumber: room.round,
    roles,
    policeId: room.policeId!,
    chosenId,
    isCorrect,
    scores,
  });

  room.phase = "reveal-roles";

  const events: EngineEvent[] = [
    { event: SocketEvents.SHOW_RESULT, payload: { isCorrect } },
    { event: SocketEvents.PHASE_CHANGED, payload: { phase: "reveal-roles" } },
    { event: SocketEvents.GUESS_SUBMITTED, payload: { playerId: player.id } },
    { event: SocketEvents.ROLES_REVEALED, payload: { roles } },
  ];

  const schedule: ScheduledEvent[] = [
    {
      delay: PHASE_DELAYS["reveal-roles"]!,
      fromPhase: "reveal-roles",
      phase: "score-update",
      events: [
        {
          event: SocketEvents.ROUND_RESULT,
          payload: {
            roundNumber: room.round,
            isCorrect,
            scores,
            roles,
            policeId: room.policeId,
            chosenId,
          },
        },
      ],
    },
    {
      delay: PHASE_DELAYS["reveal-roles"]! + PHASE_DELAYS["score-update"]!,
      fromPhase: "score-update",
      phase: "leaderboard",
      events: [],
    },
  ];

  return { ok: true, events, targetedEvents: [], schedule };
}

/**
 * Start the next round (host action).
 */
export function nextRound(room: Room, player: Player): EngineResult {
  const hostErr = validateHost(room, player);
  if (hostErr) return hostErr;

  const phaseErr = validatePhase(room, "leaderboard");
  if (phaseErr) return phaseErr;

  for (const p of room.players) {
    p.currentRole = undefined;
    p.publicRole = undefined;
    p.hasRevealed = false;
    p.hasHidden = false;
    p.currentScore = 0;
  }
  room.policeId = undefined;

  room.round += 1;
  room.phase = "shuffling";

  const events: EngineEvent[] = [
    { event: SocketEvents.PHASE_CHANGED, payload: { phase: "shuffling" } },
    { event: SocketEvents.NEXT_ROUND_STARTED, payload: { round: room.round } },
  ];

  const schedule: ScheduledEvent[] = [
    {
      delay: PHASE_DELAYS.shuffling!,
      fromPhase: "shuffling",
      phase: "card-distribution",
      events: [],
    },
  ];

  return { ok: true, events, targetedEvents: [], schedule };
}

/**
 * Generic phase transition handler.
 * Validates the transition via the state machine and applies it.
 * For leaderboard, also computes SCORE_UPDATED and LEADERBOARD_UPDATED events.
 */
export function advanceToPhase(room: Room, phase: GamePhase): EngineResult {
  if (!canTransition(room.phase, phase)) {
    return invalid(`Cannot transition from ${room.phase} to ${phase}`, "INVALID_TRANSITION");
  }

  // Transitioning out of shuffling requires role distribution
  if (room.phase === "shuffling") {
    return distributeAndDeal(room);
  }

  room.phase = phase;
  const events: EngineEvent[] = [
    { event: SocketEvents.PHASE_CHANGED, payload: { phase } },
  ];

  if (phase === "leaderboard") {
    const scores: Record<string, number> = {};
    const totals: Record<string, number> = {};
    for (const p of room.players) {
      scores[p.id] = p.currentScore;
      totals[p.id] = p.totalScore;
    }
    events.push({ event: SocketEvents.SCORE_UPDATED, payload: { scores, totals } });

    const leaderboard = room.players
      .map((p) => ({ playerId: p.id, name: p.name, score: p.totalScore }))
      .sort((a, b) => b.score - a.score);
    events.push({ event: SocketEvents.LEADERBOARD_UPDATED, payload: { leaderboard } });
  }

  return { ok: true, events, targetedEvents: [] };
}

/**
 * End the game (host action from leaderboard phase).
 * Sets phase to finished, computes winner + statistics.
 */
export function endGame(room: Room, player: Player): EngineResult {
  const hostErr = validateHost(room, player);
  if (hostErr) return hostErr;

  const phaseErr = validatePhase(room, "leaderboard");
  if (phaseErr) return phaseErr;

  room.phase = "finished";
  room.finishedAt = Date.now();

  const playerNames: Record<string, string> = {};
  for (const p of room.players) {
    playerNames[p.id] = p.name;
  }

  const result = buildGameResult(room.code, room.roundHistory, playerNames);
  room.winnerId = result.winnerId;
  room.winnerName = result.winnerName;

  const playerStats: Record<string, ReturnType<typeof calculatePlayerStats>> = {};
  const allWinners = result.leaderboard
    .filter((e) => e.totalScore === result.leaderboard[0].totalScore)
    .map((e) => e.playerId);
  for (const p of room.players) {
    playerStats[p.id] = calculatePlayerStats(p.id, room.roundHistory, allWinners);
    p.statistics.gamesPlayed += playerStats[p.id].gamesPlayed;
    p.statistics.wins += playerStats[p.id].wins;
    if (playerStats[p.id].highestScore > p.statistics.highestScore) {
      p.statistics.highestScore = playerStats[p.id].highestScore;
    }
    p.statistics.totalScore += playerStats[p.id].totalScore;
    if (!p.statistics.timesRole) {
      p.statistics.timesRole = emptyRoleCounts();
    }
    for (const role of ALL_ROLES) {
      p.statistics.timesRole[role] += playerStats[p.id].timesRole[role];
    }
    p.statistics.correctGuesses += playerStats[p.id].correctGuesses;
    p.statistics.wrongGuesses += playerStats[p.id].wrongGuesses;
    p.statistics.averageScore = p.statistics.totalScore / Math.max(1, p.statistics.gamesPlayed);
  }

  const leaderboard = room.players
    .map((p) => ({ playerId: p.id, name: p.name, score: p.totalScore }))
    .sort((a, b) => b.score - a.score);

  return {
    ok: true,
    events: [
      { event: SocketEvents.PHASE_CHANGED, payload: { phase: "finished" } },
      {
        event: SocketEvents.GAME_OVER,
        payload: {
          winnerId: result.winnerId,
          winnerName: result.winnerName,
          leaderboard,
          playerStatistics: playerStats,
          roundHistory: room.roundHistory.map((r) => ({
            roundNumber: r.roundNumber,
            roles: r.roles,
            policeId: r.policeId,
            chosenId: r.chosenId,
            isCorrect: r.isCorrect,
            scores: r.scores,
          })),
        },
      },
    ],
    targetedEvents: [],
  };
}

/**
 * Validate that a player can perform an action in the current phase.
 * Returns null if valid, or an EngineResult error if invalid.
 */
export function validateAction(
  room: Room,
  player: Player,
  action: "start-round" | "reveal-card" | "hide-card" | "call-police" | "submit-guess" | "next-round",
  _payload?: unknown
): EngineResult | null {
  switch (action) {
    case "start-round":
      return validateHost(room, player) ?? null;
    case "reveal-card":
    case "hide-card":
      return validatePhase(room, "card-reveal");
    case "call-police":
      return validatePhase(room, "card-reveal");
    case "submit-guess":
      return validatePhase(room, "guessing");
    case "next-round":
      return validateHost(room, player) ?? validatePhase(room, "leaderboard");
  }
}
