import type { GameRole } from "../types";
import { ALL_ROLES, MAX_PLAYERS, MIN_PLAYERS } from "../game/roles";
import { characterAssets } from "../assets/characterAssets";

export { MAX_PLAYERS, MIN_PLAYERS, ALL_ROLES };

export const ROLE_POINTS: Record<GameRole, number> = {
  raja: 1000,
  police: 800,
  sipahi: 600,
  chor: 0,
  daku: 200,
  joker: 300,
  "aam-aadmi": 100,
  jasoos: 400,
};

export const ROLE_LABELS: Record<GameRole, string> = {
  raja: "Raja",
  police: "Police",
  sipahi: "Sipahi",
  chor: "Chor",
  daku: "Daku",
  joker: "Joker",
  "aam-aadmi": "Aam Aadmi",
  jasoos: "Jasoos",
};

export const ROLE_EMOJIS: Record<GameRole, string> = {
  raja: "👑",
  police: "👮",
  sipahi: "🪖",
  chor: "🥷",
  daku: "🦹",
  joker: "🤡",
  "aam-aadmi": "👤",
  jasoos: "🕵️",
};

export const ROLE_COLORS: Record<GameRole, string> = {
  raja: "#ffd700",
  police: "#7c3aed",
  sipahi: "#f59e0b",
  chor: "#ef4444",
  daku: "#ec4899",
  joker: "#22d3ee",
  "aam-aadmi": "#94a3b8",
  jasoos: "#10b981",
};

export const CARD_IMAGES: Record<GameRole, string> & { hidden: string } = {
  hidden: characterAssets.BACK,
  raja: characterAssets.RAJA,
  police: characterAssets.POLICE,
  sipahi: characterAssets.SIPAHI,
  chor: characterAssets.CHOR,
  daku: characterAssets.DAKU,
  joker: characterAssets.JOKER,
  "aam-aadmi": characterAssets.AAM_AADMI,
  jasoos: characterAssets.JASOOS,
};

export { characterAssets };

export const ROOM_CODE_LENGTH = 6;

export const SCORING = {
  RAJA_CORRECT: 1000,
  POLICE_CORRECT: 800,
  SIPAHI_CORRECT: 600,
  CHOR_CORRECT: 0,
  DAKU_POINTS: 200,
  JOKER_POINTS: 300,
  AAM_AADMI_POINTS: 100,
  JASOOS_POINTS: 400,
  RAJA_WRONG: 1000,
  POLICE_WRONG: 0,
  SIPAHI_WRONG: 600,
  CHOR_WRONG: 800,
} as const;

export const PHASE_DURATIONS = {
  shuffling: 3000,
  "card-distribution": 0,
  "card-reveal": 0,
  "police-reveal": 3000,
  guessing: 0,
  "reveal-roles": 4000,
  "score-update": 2000,
  leaderboard: 0,
} as const;
