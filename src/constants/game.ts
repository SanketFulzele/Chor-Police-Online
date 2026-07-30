import type { GameRole } from "../types";

export const ROLE_POINTS: Record<GameRole, number> = {
  raja: 1000,
  mantri: 500,
  chor: 0,
  daku: 300,
};

export const ROLE_LABELS: Record<GameRole, string> = {
  raja: "Raja",
  mantri: "Mantri",
  chor: "Chor",
  daku: "Daku",
};

export const ROLE_EMOJIS: Record<GameRole, string> = {
  raja: "👑",
  mantri: "👮",
  chor: "🥷",
  daku: "🔫",
};

export const ROLE_COLORS: Record<GameRole, string> = {
  raja: "#ffd700",
  mantri: "#7c3aed",
  chor: "#ef4444",
  daku: "#f59e0b",
};

export const MAX_PLAYERS = 4;
export const ROOM_CODE_LENGTH = 6;

export const SCORING = {
  RAJA_CORRECT: 1000,
  MANTRI_CORRECT: 500,
  DAKU_CORRECT: 300,
  CHOR_CORRECT: 0,
  RAJA_WRONG: 1000,
  MANTRI_WRONG: 0,
  DAKU_WRONG: 300,
  CHOR_WRONG: 500,
} as const;

export const PHASE_DURATIONS = {
  shuffling: 3000,
  "card-distribution": 0,
  "card-reveal": 0,
  "waiting-raja": 0,
  "raja-calling": 0,
  "mantri-reveal": 3000,
  guessing: 0,
  "reveal-roles": 4000,
  "score-update": 2000,
  leaderboard: 0,
} as const;
