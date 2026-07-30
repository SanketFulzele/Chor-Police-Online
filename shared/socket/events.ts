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

  // Game lifecycle
  START_GAME: "start-game",
  GAME_STARTING: "game-starting",
  CARDS_DISTRIBUTED: "cards-distributed",
  PHASE_CHANGED: "phase-changed",

  // Police selection
  POLICE_SELECT: "police-select",
  POLICE_SELECTED: "police-selected",

  // End game
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
