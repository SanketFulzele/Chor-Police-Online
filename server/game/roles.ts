import type { GameRole } from "../shared/socket/types.js";

/**
 * Every role is unique each round — one role per player.
 * The first four roles are always in play; the optional roles
 * are added one at a time as the player count grows.
 */
export const PERMANENT_ROLES: GameRole[] = ["raja", "police", "sipahi", "chor"];

export const OPTIONAL_ROLES: GameRole[] = ["daku", "aam-aadmi", "joker", "jasoos"];

export const ALL_ROLES: GameRole[] = [...PERMANENT_ROLES, ...OPTIONAL_ROLES];

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = ALL_ROLES.length;

/**
 * The set of roles dealt in a game of the given size.
 * Pool size always equals the player count, so every role
 * appears exactly once per round.
 */
export function getRolePool(playerCount: number): GameRole[] {
  return ALL_ROLES.slice(0, Math.min(Math.max(playerCount, MIN_PLAYERS), MAX_PLAYERS));
}

/** A fresh zeroed count map for every role. */
export function emptyRoleCounts(): Record<GameRole, number> {
  const counts = {} as Record<GameRole, number>;
  for (const role of ALL_ROLES) counts[role] = 0;
  return counts;
}
