export const SocketEvents = {
  // Room lifecycle
  CREATE_ROOM: "create-room",
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  ROOM_CREATED: "room-created",
  ROOM_JOINED: "room-joined",
  ROOM_UPDATED: "room-updated",
  ROOM_DESTROYED: "room-destroyed",
  HOST_CHANGED: "host-changed",

  // Player readiness
  PLAYER_READY: "player-ready",
  PLAYER_UNREADY: "player-unready",

  // Game lifecycle
  START_GAME: "start-game",
  GAME_STARTING: "game-starting",
  CARDS_DISTRIBUTED: "cards-distributed",
  PHASE_CHANGED: "phase-changed",

  // Card reveal / hide
  REVEAL_CARD: "reveal-card",
  HIDE_CARD: "hide-card",
  CARD_REVEALED: "card-revealed",
  CARD_HIDDEN: "card-hidden",

  // Raja / Police phase
  CALL_POLICE: "call-police",
  RAJA_REVEALED: "raja-revealed",
  POLICE_REVEALED: "police-revealed",

  // Result
  SHOW_RESULT: "show-result",

  // Guessing
  SUBMIT_GUESS: "submit-guess",
  GUESS_SUBMITTED: "guess-submitted",

  // Round result / scoring
  ROLES_REVEALED: "roles-revealed",
  ROUND_RESULT: "round-result",
  SCORE_UPDATED: "score-updated",
  LEADERBOARD_UPDATED: "leaderboard-updated",
  NEXT_ROUND: "next-round",
  NEXT_ROUND_STARTED: "next-round-started",
  END_GAME: "end-game",
  GAME_OVER: "game-over",

  // Reconnect
  RECONNECT: "reconnect",
  PLAYER_RECONNECTED: "player-reconnected",
  RECONNECT_STATE: "reconnect-state",

  // Disconnect
  PLAYER_DISCONNECTED: "player-disconnected",

  // Error
  ERROR_MESSAGE: "error-message",
} as const;

export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
