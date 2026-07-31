import type { GameRole } from "../types";
import backcard from "../assets/backcard.jpg";
import raja from "../assets/raja.jpg";
import mantri from "../assets/mantri.jpg";
import sipahi from "../assets/sipahi.jpg";
import chor from "../assets/chor.jpg";

export const ROLE_POINTS: Record<GameRole, number> = {
  raja: 1000,
  mantri: 500,
  chor: 0,
  sipahi: 300,
};

export const ROLE_LABELS: Record<GameRole, string> = {
  raja: "Raja",
  mantri: "Mantri",
  chor: "Chor",
  sipahi: "Sipahi",
};

export const ROLE_COLORS: Record<GameRole, string> = {
  raja: "#ffd700",
  mantri: "#7c3aed",
  chor: "#ef4444",
  sipahi: "#f59e0b",
};

export const CARD_IMAGES: Record<GameRole, string> & { hidden: string } = {
  hidden: backcard,
  raja,
  mantri,
  sipahi,
  chor,
};

export const MAX_PLAYERS = 4;
export const ROOM_CODE_LENGTH = 6;

export const SCORING = {
  RAJA_CORRECT: 1000,
  MANTRI_CORRECT: 500,
  SIPAHI_CORRECT: 300,
  CHOR_CORRECT: 0,
  RAJA_WRONG: 1000,
  MANTRI_WRONG: 0,
  SIPAHI_WRONG: 300,
  CHOR_WRONG: 500,
} as const;

export const PHASE_DURATIONS = {
  shuffling: 3000,
  "card-distribution": 0,
  "card-reveal": 0,
  "mantri-reveal": 3000,
  guessing: 0,
  "reveal-roles": 4000,
  "score-update": 2000,
  leaderboard: 0,
} as const;
