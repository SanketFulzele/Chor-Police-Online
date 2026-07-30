import type { Room, Player, GameRole, GamePhase } from "../types";
import { SocketEvents } from "../../shared/socket/events";
import { canTransition } from "./gameStateMachine";
import { distributeRoles } from "./roleDistributor";
import type { RoleHistory } from "./types";

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

const PHASE_DELAYS: Partial<Record<GamePhase, number>> = {
  "role-assignment": 2000,
  "reveal-raja": 3000,
  "reveal-mantri": 3000,
  "reveal-result": 4000,
};

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

export function startGame(room: Room, player: Player): EngineResult {
  const hostErr = validateHost(room, player);
  if (hostErr) return hostErr;

  if (room.players.length < 4 || !room.players.every((p) => p.isConnected)) {
    return invalid("Need 4 players, all connected", "INVALID_STATE");
  }

  for (const p of room.players) {
    p.currentRole = undefined;
    p.hasRevealed = false;
    p.hasHidden = false;
    p.currentScore = 0;
  }
  room.round = 1;
  room.mantriId = undefined;

  const playerIds = room.players.map((p) => p.id);
  const roleHist: RoleHistory[] = room.players.map((p) => ({
    playerId: p.id,
    roles: [...p.roleHistory],
  }));
  const distribution = distributeRoles(playerIds, roleHist, 0);

  for (const p of room.players) {
    const role = distribution.assignments[p.id];
    p.currentRole = role;
    p.roleHistory.push(role);
  }

  room.phase = "role-assignment";

  const events: EngineEvent[] = [
    { event: SocketEvents.GAME_STARTING, payload: {} },
  ];

  const targetedEvents: TargetedEvent[] = room.players.map((p) => ({
    event: SocketEvents.CARDS_DISTRIBUTED,
    payload: { role: p.currentRole, phase: "role-assignment" },
    playerId: p.id,
  }));

  const schedule: ScheduledEvent[] = [
    {
      delay: PHASE_DELAYS["role-assignment"]!,
      fromPhase: "role-assignment",
      phase: "reveal-raja",
      events: [],
    },
  ];

  return { ok: true, events, targetedEvents, schedule };
}

export function policeSelect(room: Room, player: Player, chosenId: string): EngineResult {
  const phaseErr = validatePhase(room, "police-selection");
  if (phaseErr) return phaseErr;

  if (player.currentRole !== "police") {
    return invalid("Only the Police can make a selection", "NOT_POLICE");
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

  const isCorrect = target.currentRole === "chor";
  const chor = room.players.find((p) => p.currentRole === "chor");

  const scores: Record<string, number> = {};
  for (const p of room.players) {
    let score = 0;
    if (p.currentRole === "raja" || p.currentRole === "mantri" || p.currentRole === "police") {
      score = isCorrect ? 500 : 0;
    } else if (p.currentRole === "chor") {
      score = isCorrect ? 0 : 500;
    }
    scores[p.id] = score;
    p.currentScore = score;
    p.totalScore += score;
  }

  const roles: Record<string, GameRole> = {};
  for (const p of room.players) {
    roles[p.id] = p.currentRole!;
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

  const policeEvents: EngineEvent[] = [
    {
      event: SocketEvents.POLICE_SELECTED,
      payload: { chosenId, chorId: chor?.id ?? "", isCorrect },
    },
    {
      event: SocketEvents.PHASE_CHANGED,
      payload: { phase: "reveal-result", chosenId, chorId: chor?.id ?? "", isCorrect },
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

  return { ok: true, events: policeEvents, targetedEvents: [], schedule };
}

export function advanceToPhase(room: Room, phase: GamePhase): EngineResult {
  if (!canTransition(room.phase, phase)) {
    return invalid(`Cannot transition from ${room.phase} to ${phase}`, "INVALID_TRANSITION");
  }

  room.phase = phase;
  const events: EngineEvent[] = [];
  const schedule: ScheduledEvent[] = [];

  if (phase === "reveal-raja") {
    const raja = room.players.find((p) => p.currentRole === "raja");
    events.push({
      event: SocketEvents.PHASE_CHANGED,
      payload: { phase: "reveal-raja", rajaId: raja?.id ?? "" },
    });
    schedule.push({
      delay: PHASE_DELAYS["reveal-raja"]!,
      fromPhase: "reveal-raja",
      phase: "reveal-mantri",
      events: [],
    });
  } else if (phase === "reveal-mantri") {
    const mantri = room.players.find((p) => p.currentRole === "mantri");
    events.push({
      event: SocketEvents.PHASE_CHANGED,
      payload: { phase: "reveal-mantri", mantriId: mantri?.id ?? "" },
    });
    schedule.push({
      delay: PHASE_DELAYS["reveal-mantri"]!,
      fromPhase: "reveal-mantri",
      phase: "police-selection",
      events: [],
    });
  } else if (phase === "police-selection") {
    events.push({
      event: SocketEvents.PHASE_CHANGED,
      payload: { phase: "police-selection" },
    });
  } else if (phase === "finished") {
    const isCorrect = room.roundHistory[room.roundHistory.length - 1]?.isCorrect ?? false;
    const chor = room.players.find((p) => p.currentRole === "chor");

    let winnerId = "";
    let winnerName = "";
    if (isCorrect) {
      const winner = room.players.find((p) => p.currentRole === "raja");
      if (winner) {
        winnerId = winner.id;
        winnerName = winner.name;
      }
    } else {
      if (chor) {
        winnerId = chor.id;
        winnerName = chor.name;
      }
    }

    room.winnerId = winnerId;
    room.winnerName = winnerName;
    room.finishedAt = Date.now();

    const leaderboard = room.players
      .map((p) => ({ playerId: p.id, name: p.name, score: p.totalScore }))
      .sort((a, b) => b.score - a.score);

    events.push({
      event: SocketEvents.GAME_OVER,
      payload: {
        winnerId,
        winnerName,
        leaderboard,
        playerStatistics: {},
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
  }

  return { ok: true, events, targetedEvents: [], schedule };
}

export function endGame(room: Room, player: Player): EngineResult {
  const hostErr = validateHost(room, player);
  if (hostErr) return hostErr;

  room.phase = "finished";
  room.finishedAt = Date.now();

  const isCorrect = room.roundHistory[room.roundHistory.length - 1]?.isCorrect ?? false;
  const chor = room.players.find((p) => p.currentRole === "chor");

  let winnerId = "";
  let winnerName = "";
  if (isCorrect) {
    const winner = room.players.find((p) => p.currentRole === "raja");
    if (winner) {
      winnerId = winner.id;
      winnerName = winner.name;
    }
  } else {
    if (chor) {
      winnerId = chor.id;
      winnerName = chor.name;
    }
  }

  room.winnerId = winnerId;
  room.winnerName = winnerName;

  const leaderboard = room.players
    .map((p) => ({ playerId: p.id, name: p.name, score: p.totalScore }))
    .sort((a, b) => b.score - a.score);

  const events: EngineEvent[] = [
    {
      event: SocketEvents.GAME_OVER,
      payload: {
        winnerId,
        winnerName,
        leaderboard,
        playerStatistics: {},
        roundHistory: room.roundHistory.map((r) => ({
          roundNumber: r.roundNumber,
          roles: r.roles,
          mantriId: r.mantriId,
          chosenId: r.chosenId,
          isCorrect: r.isCorrect,
          scores: r.scores,
        })),
      },
    },
  ];

  return { ok: true, events, targetedEvents: [] };
}

export function validateAction(
  room: Room,
  player: Player,
  action: "start-round" | "select-police"
): EngineResult | null {
  switch (action) {
    case "start-round":
      return validateHost(room, player) ?? null;
    case "select-police":
      return validatePhase(room, "police-selection");
  }
}
