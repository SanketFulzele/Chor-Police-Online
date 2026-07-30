import { SocketEvents } from "./events";
import type { GameRole, PlayerStatistics, Room } from "./types";

// ---- Room payloads ----

export interface CreateRoomPayload {
  playerName: string;
}

export interface CreateRoomAckPayload {
  roomCode: string;
  playerId: string;
  room: Room;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface JoinRoomAckPayload {
  room: Room;
  playerId: string;
}

export interface RoomUpdatedPayload {
  room: Room;
}

export interface HostChangedPayload {
  newHostId: string;
}

// ---- Game lifecycle payloads ----

export interface GameStartingPayload {
  room: Room;
}

export interface CardsDistributedPayload {
  role: GameRole;
  phase: string;
}

export interface PhaseChangedPayload {
  phase: string;
  rajaId?: string;
  mantriId?: string;
  chosenId?: string;
  chorId?: string;
  isCorrect?: boolean;
}

// ---- Police selection payloads ----

export interface PoliceSelectPayload {
  chosenId: string;
}

export interface PoliceSelectedPayload {
  chosenId: string;
  chorId: string;
  isCorrect: boolean;
}

// ---- End game payloads ----

export interface GameOverPayload {
  winnerId: string;
  winnerName: string;
  winnerLabel: string;
  leaderboard: { playerId: string; name: string; score: number }[];
  playerStatistics: Record<string, PlayerStatistics>;
  roundHistory: {
    roundNumber: number;
    roles: Record<string, GameRole>;
    mantriId: string;
    chosenId: string;
    isCorrect: boolean;
    scores: Record<string, number>;
  }[];
}

// ---- Reconnect payloads ----

export interface ReconnectPayload {
  roomCode: string;
  playerId: string;
}

export interface ReconnectStatePayload {
  room: Room;
  playerId: string;
  myRole?: GameRole;
}

export interface PlayerReconnectedPayload {
  playerId: string;
}

export interface PlayerDisconnectedPayload {
  playerId: string;
}

// ---- Error payload ----

export interface ErrorMessagePayload {
  message: string;
  code?: string;
}

// ---- Event-to-payload mapping ----

export interface SocketPayloadMap {
  [SocketEvents.CREATE_ROOM]: CreateRoomPayload;
  [SocketEvents.JOIN_ROOM]: JoinRoomPayload;
  [SocketEvents.LEAVE_ROOM]: undefined;
  [SocketEvents.START_GAME]: undefined;
  [SocketEvents.POLICE_SELECT]: PoliceSelectPayload;
  [SocketEvents.END_GAME]: undefined;
  [SocketEvents.RECONNECT]: ReconnectPayload;

  [SocketEvents.ROOM_CREATED]: CreateRoomAckPayload;
  [SocketEvents.ROOM_JOINED]: JoinRoomAckPayload;
  [SocketEvents.ROOM_UPDATED]: RoomUpdatedPayload;
  [SocketEvents.ROOM_DESTROYED]: undefined;
  [SocketEvents.HOST_CHANGED]: HostChangedPayload;
  [SocketEvents.GAME_STARTING]: GameStartingPayload;
  [SocketEvents.CARDS_DISTRIBUTED]: CardsDistributedPayload;
  [SocketEvents.PHASE_CHANGED]: PhaseChangedPayload;
  [SocketEvents.POLICE_SELECTED]: PoliceSelectedPayload;
  [SocketEvents.GAME_OVER]: GameOverPayload;
  [SocketEvents.RECONNECT_STATE]: ReconnectStatePayload;
  [SocketEvents.PLAYER_RECONNECTED]: PlayerReconnectedPayload;
  [SocketEvents.PLAYER_DISCONNECTED]: PlayerDisconnectedPayload;
  [SocketEvents.ERROR_MESSAGE]: ErrorMessagePayload;
}
