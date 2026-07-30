import type { Room, Player, GameRole, GamePhase } from "../shared/socket/types.js";
import { SocketEvents } from "../shared/socket/events.js";
import { canTransition } from "./gameStateMachine.js";
import { distributeRoles } from "./roleDistributor.js";
import type { RoleHistory } from "./types.js";
import { calculateScores } from "./scoreCalculator.js";
import { buildGameResult } from "./winnerCalculator.js";
import { calculatePlayerStats } from "./statisticsManager.js";

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

// ---- Phase durations ----

const PHASE_DELAYS: Partial<Record<GamePhase, number>> = {
  "role-assignment": 2500,
  "reveal-raja": 3000,
  "reveal-mantri": 3000,
  "reveal-result": 4000,
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

function invalid(msg: string, code: string): EngineResult {
  return { ok: false, error: { message: msg, code }, events: [], targetedEvents: [] };
}

function validateHost(room: Room, player: Player): EngineResult | null {
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
 * Distributes roles, sends private role cards, schedules reveal-raja.
 */
export function startGame(room: Room, player: Player): EngineResult {
  const hostErr = validateHost(room, player);
  if (hostErr) return hostErr;

  const connectedCount = room.players.filter((p) => p.isConnected).length;
  if (connectedCount < 4) {
    return invalid("Need 4 connected players to start", "INVALID_STATE");
  }

  for (const p of room.players) {
    p.currentRole = undefined;
  }

  const playerIds = room.players.map((p) => p.id);
  const roleHist = roleHistoryList(room);
  const distribution = distributeRoles(playerIds, roleHist, 0);

  for (const p of room.players) {
    p.currentRole = distribution.assignments[p.id];
    p.roleHistory.push(distribution.assignments[p.id]);
  }

  room.phase = "role-assignment";
  room.round = 1;

  const targetedEvents: TargetedEvent[] = [];
  for (const p of room.players) {
    targetedEvents.push({
      event: SocketEvents.CARDS_DISTRIBUTED,
      payload: { role: p.currentRole, phase: "role-assignment" },
      playerId: p.id,
    });
  }

  const schedule: ScheduledEvent[] = [
    {
      delay: PHASE_DELAYS["role-assignment"]!,
      fromPhase: "role-assignment",
      phase: "reveal-raja",
      events: [],
    },
  ];

  return { ok: true, events: [], targetedEvents, schedule };
}

/**
 * Advance to a new phase. Called by scheduled events.
 */
export function advanceToPhase(room: Room, phase: GamePhase): EngineResult {
  if (!canTransition(room.phase, phase)) {
    return invalid(`Cannot transition from ${room.phase} to ${phase}`, "INVALID_TRANSITION");
  }

  room.phase = phase;
  const events: EngineEvent[] = [];
  const schedule: ScheduledEvent[] = [];

  const raja = room.players.find((p) => p.currentRole === "raja");
  const mantri = room.players.find((p) => p.currentRole === "mantri");

  switch (phase) {
    case "reveal-raja": {
      events.push({
        event: SocketEvents.PHASE_CHANGED,
        payload: { phase, rajaId: raja?.id },
      });
      schedule.push({
        delay: PHASE_DELAYS["reveal-raja"]!,
        fromPhase: "reveal-raja",
        phase: "reveal-mantri",
        events: [],
      });
      break;
    }

    case "reveal-mantri": {
      events.push({
        event: SocketEvents.PHASE_CHANGED,
        payload: { phase, rajaId: raja?.id, mantriId: mantri?.id },
      });
      schedule.push({
        delay: PHASE_DELAYS["reveal-mantri"]!,
        fromPhase: "reveal-mantri",
        phase: "police-selection",
        events: [],
      });
      break;
    }

    case "police-selection": {
      events.push({
        event: SocketEvents.PHASE_CHANGED,
        payload: { phase, rajaId: raja?.id, mantriId: mantri?.id },
      });
      break;
    }

    case "finished": {
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
        p.statistics.timesRaja += playerStats[p.id].timesRaja;
        p.statistics.timesMantri += playerStats[p.id].timesMantri;
        p.statistics.timesChor += playerStats[p.id].timesChor;
        p.statistics.timesPolice += playerStats[p.id].timesPolice;
        p.statistics.correctGuesses += playerStats[p.id].correctGuesses;
        p.statistics.wrongGuesses += playerStats[p.id].wrongGuesses;
        p.statistics.averageScore = p.statistics.totalScore / Math.max(1, p.statistics.gamesPlayed);
      }

      const leaderboard = room.players
        .map((p) => ({ playerId: p.id, name: p.name, score: p.totalScore }))
        .sort((a, b) => b.score - a.score);

      events.push({ event: SocketEvents.PHASE_CHANGED, payload: { phase: "finished" } });
      events.push({
        event: SocketEvents.GAME_OVER,
        payload: {
          winnerId: result.winnerId,
          winnerName: result.winnerName,
          winnerLabel: result.winnerId === room.players.find((p) => p.currentRole === "chor")?.id ? "Chor" : "Police & Raja",
          leaderboard,
          playerStatistics: playerStats,
          roundHistory: room.roundHistory.map((r) => ({
            roundNumber: r.roundNumber,
            roles: r.roles,
            mantriId: r.mantriId,
            chosenId: r.chosenId,
            isCorrect: r.isCorrect,
            scores: r.scores,
          })),
        },
      });
      break;
    }

    default:
      events.push({
        event: SocketEvents.PHASE_CHANGED,
        payload: { phase },
      });
      break;
  }

  return { ok: true, events, targetedEvents: [], schedule };
}

/**
 * Police selects a candidate to accuse as Chor.
 */
export function policeSelect(room: Room, player: Player, chosenId: string): EngineResult {
  const phaseErr = validatePhase(room, "police-selection");
  if (phaseErr) return phaseErr;

  if (player.currentRole !== "police") {
    return invalid("Only the Police can select", "NOT_POLICE");
  }

  const target = room.players.find((p) => p.id === chosenId);
  if (!target) {
    return invalid("Invalid player", "INVALID_TARGET");
  }
  if (target.id === player.id) {
    return invalid("Cannot select yourself", "SELF_TARGET");
  }
  if (target.currentRole === "raja" || target.currentRole === "mantri") {
    return invalid("Cannot select Raja or Mantri", "INVALID_TARGET");
  }
  if (!target.isConnected) {
    return invalid("Player disconnected", "TARGET_DISCONNECTED");
  }

  const roles = getRoleMap(room);
  const chor = room.players.find((p) => p.currentRole === "chor");
  const { scores, isCorrect } = calculateScores({ chosenId, roles });

  for (const p of room.players) {
    p.currentScore = scores[p.id] ?? 0;
    p.totalScore += p.currentScore;
  }

  room.mantriId = room.players.find((p) => p.currentRole === "mantri")?.id ?? "";
  room.roundHistory.push({
    roundNumber: room.round,
    roles,
    mantriId: room.mantriId,
    chosenId,
    isCorrect,
    scores,
  });

  room.phase = "reveal-result";

  const events: EngineEvent[] = [
    {
      event: SocketEvents.PHASE_CHANGED,
      payload: {
        phase: "reveal-result",
        rajaId: room.players.find((p) => p.currentRole === "raja")?.id,
        mantriId: room.mantriId,
        chosenId,
        chorId: chor?.id,
        isCorrect,
      },
    },
  ];

  const schedule: ScheduledEvent[] = [
    {
      delay: PHASE_DELAYS["reveal-result"]!,
      fromPhase: "reveal-result",
      phase: "finished",
      events: [],
    },
  ];

  return { ok: true, events, targetedEvents: [], schedule };
}

/**
 * End the game (host action from any phase).
 */
export function endGame(room: Room, player: Player): EngineResult {
  const hostErr = validateHost(room, player);
  if (hostErr) return hostErr;

  return advanceToPhase(room, "finished");
}

export function validateAction(
  room: Room,
  player: Player,
  action: "start-game" | "police-select" | "end-game",
  _payload?: unknown
): EngineResult | null {
  switch (action) {
    case "start-game":
      return validateHost(room, player) ?? null;
    case "police-select":
      return validatePhase(room, "police-selection");
    case "end-game":
      return validateHost(room, player) ?? null;
  }
}
