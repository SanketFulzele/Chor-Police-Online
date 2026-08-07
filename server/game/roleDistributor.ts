import type { GameRole } from "../shared/socket/types.js";
import type { RoleDistribution, RoleHistory } from "./types";
import { getRolePool, MAX_PLAYERS, MIN_PLAYERS } from "./roles.js";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function countRole(history: GameRole[], role: GameRole): number {
  return history.filter((r) => r === role).length;
}

export function distributeRoles(
  playerIds: string[],
  roleHistory: RoleHistory[],
  roundNumber: number
): RoleDistribution {
  if (playerIds.length < MIN_PLAYERS || playerIds.length > MAX_PLAYERS) {
    throw new Error(`Need between ${MIN_PLAYERS} and ${MAX_PLAYERS} players`);
  }

  const roles = getRolePool(playerIds.length);
  const historyMap = new Map<string, GameRole[]>();
  for (const h of roleHistory) {
    historyMap.set(h.playerId, h.roles);
  }

  if (roundNumber === 0) {
    const shuffledRoles = shuffleArray(roles);
    const assignments: Record<string, GameRole> = {};
    for (let i = 0; i < playerIds.length; i++) {
      assignments[playerIds[i]] = shuffledRoles[i];
    }
    return { roundNumber, assignments };
  }

  const lastRoleMap = new Map<string, GameRole>();
  for (const [pid, roles] of historyMap) {
    if (roles.length > 0) {
      lastRoleMap.set(pid, roles[roles.length - 1]);
    }
  }

  const deficitMap = new Map<string, Map<GameRole, number>>();
  for (const pid of playerIds) {
    const history = historyMap.get(pid) ?? [];
    const deficits = new Map<GameRole, number>();
    for (const role of roles) {
      const expected = (roundNumber + 1) / playerIds.length;
      const actual = countRole(history, role);
      deficits.set(role, expected - actual);
    }
    deficitMap.set(pid, deficits);
  }

  const assignments: Record<string, GameRole> = {};
  const assigned = new Set<string>();
  const rolesToAssign = shuffleArray(roles);

  for (const role of rolesToAssign) {
    const candidates = playerIds
      .filter((pid) => !assigned.has(pid))
      .sort((a, b) => {
        const aLast = lastRoleMap.get(a);
        const bLast = lastRoleMap.get(b);
        const aRepeat = aLast === role ? -100 : 0;
        const bRepeat = bLast === role ? -100 : 0;
        const aDeficit = deficitMap.get(a)?.get(role) ?? 0;
        const bDeficit = deficitMap.get(b)?.get(role) ?? 0;
        return bDeficit + bRepeat - (aDeficit + aRepeat);
      });

    const chosen = candidates[0];
    assignments[chosen] = role;
    assigned.add(chosen);
  }

  return { roundNumber, assignments };
}

export function calculateDeficit(
  playerId: string,
  role: GameRole,
  history: RoleHistory[],
  totalRounds: number,
  rolePoolSize = MAX_PLAYERS
): number {
  const h = history.find((x) => x.playerId === playerId);
  const actual = h ? countRole(h.roles, role) : 0;
  const expected = totalRounds / rolePoolSize;
  return expected - actual;
}

export function updateRoleHistory(
  history: RoleHistory[],
  distribution: RoleDistribution
): RoleHistory[] {
  const map = new Map<string, GameRole[]>();
  for (const h of history) map.set(h.playerId, [...h.roles]);
  for (const [pid, role] of Object.entries(distribution.assignments)) {
    const existing = map.get(pid) ?? [];
    existing.push(role);
    map.set(pid, existing);
  }
  return Array.from(map.entries()).map(([playerId, roles]) => ({
    playerId,
    roles,
  }));
}
