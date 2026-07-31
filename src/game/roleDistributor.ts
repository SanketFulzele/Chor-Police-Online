import type { GameRole } from "../types";
import type { RoleDistribution, RoleHistory } from "./types";

const ROLES: GameRole[] = ["raja", "mantri", "chor", "sipahi"];

/**
 * Deficit-based fair role rotation.
 *
 * For each (player, role) pair, deficit = expected - actual.
 *   expected = roundNumber * (1 / numPlayers)
 *   actual   = how many times the player has received that role
 *
 * Players with the highest deficit for a role get priority.
 * Ties are broken randomly.
 * A player never gets the same role two rounds in a row unless forced.
 *
 * Round 0 (first round): purely random — no history to balance against.
 */

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
  if (playerIds.length !== 4) {
    throw new Error("Need exactly 4 players");
  }

  const historyMap = new Map<string, GameRole[]>();
  for (const h of roleHistory) {
    historyMap.set(h.playerId, h.roles);
  }

  // First round — purely random
  if (roundNumber === 0) {
    const shuffledRoles = shuffleArray(ROLES);
    const assignments: Record<string, GameRole> = {};
    for (let i = 0; i < playerIds.length; i++) {
      assignments[playerIds[i]] = shuffledRoles[i];
    }
    return { roundNumber, assignments };
  }

  // Subsequent rounds — deficit-based
  const lastRoleMap = new Map<string, GameRole>();
  for (const [pid, roles] of historyMap) {
    if (roles.length > 0) {
      lastRoleMap.set(pid, roles[roles.length - 1]);
    }
  }

  // Calculate deficits
  const deficitMap = new Map<string, Map<GameRole, number>>();
  for (const pid of playerIds) {
    const history = historyMap.get(pid) ?? [];
    const deficits = new Map<GameRole, number>();
    for (const role of ROLES) {
      const expected = (roundNumber + 1) / playerIds.length;
      const actual = countRole(history, role);
      deficits.set(role, expected - actual);
    }
    deficitMap.set(pid, deficits);
  }

  // Assign roles: for each role, pick the player with highest deficit
  // who hasn't been assigned yet and who didn't have this role last round
  const assignments: Record<string, GameRole> = {};
  const assigned = new Set<string>();
  const rolesToAssign = shuffleArray(ROLES);

  for (const role of rolesToAssign) {
    const candidates = playerIds
      .filter((pid) => !assigned.has(pid))
      .sort((a, b) => {
        // Prefer players who didn't have this role last round
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
  totalRounds: number
): number {
  const h = history.find((x) => x.playerId === playerId);
  const actual = h ? countRole(h.roles, role) : 0;
  const expected = totalRounds / 4;
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
