import type { GameRole } from "../types";

export const ROLE_POINTS: Record<GameRole, number> = {
  raja: 500,
  mantri: 500,
  chor: 0,
  police: 500,
};

export const ROLE_LABELS: Record<GameRole, string> = {
  raja: "Raja",
  mantri: "Mantri",
  chor: "Chor",
  police: "Police",
};

export const ROLE_EMOJIS: Record<GameRole, string> = {
  raja: "👑",
  mantri: "📜",
  chor: "🥷",
  police: "👮",
};

export const ROLE_COLORS: Record<GameRole, string> = {
  raja: "#ffd700",
  mantri: "#7c3aed",
  chor: "#ef4444",
  police: "#3b82f6",
};

export const MAX_PLAYERS = 4;
export const ROOM_CODE_LENGTH = 6;

export const SCORING = {
  CORRECT: 500,
  CHOR_CAUGHT: 0,
  CHOR_ESCAPED: 500,
} as const;
