import { SocketEvents } from "./events";
import type { ChatMessage, GameRole, PlayerStatistics, Room } from "./types";

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
}

// ---- Card action payloads ----

export interface RevealCardPayload {
  playerId: string;
}

export interface HideCardPayload {
  playerId: string;
}

// ---- Raja / Police payloads ----

export interface CallPolicePayload {
  chosenId: string;
}

export interface RajaRevealedPayload {
  playerId: string;
}

export interface PoliceRevealedPayload {
  policeId: string;
}

// ---- Result payloads ----

export interface ShowResultPayload {
  isCorrect: boolean;
}

// ---- Guessing payloads ----

export interface SubmitGuessPayload {
  chosenId: string;
}

export interface GuessSubmittedPayload {
  playerId: string;
}

// ---- Round result payloads ----

export interface RolesRevealedPayload {
  roles: Record<string, GameRole>;
}

export interface RoundResultPayload {
  roundNumber: number;
  isCorrect: boolean;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
  policeId: string;
  chosenId: string;
}

export interface ScoreUpdatedPayload {
  scores: Record<string, number>;
  totals: Record<string, number>;
}

export interface LeaderboardUpdatedPayload {
  leaderboard: { playerId: string; name: string; score: number }[];
}

export interface NextRoundStartedPayload {
  room: Room;
  round: number;
}

// ---- End game payloads ----

export interface GameOverPayload {
  winnerId: string;
  winnerName: string;
  leaderboard: { playerId: string; name: string; score: number }[];
  playerStatistics: Record<string, PlayerStatistics>;
  roundHistory: {
    roundNumber: number;
    roles: Record<string, GameRole>;
    policeId: string;
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

// ---- Chat payloads ----

export interface ChatSendPayload {
  text: string;
}

export interface ChatReceivePayload {
  message: ChatMessage;
}

export interface ChatHistoryPayload {
  messages: ChatMessage[];
}

export interface ChatTypingPayload {
  playerId: string;
  playerName: string;
  isTyping: boolean;
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
  [SocketEvents.PLAYER_READY]: undefined;
  [SocketEvents.PLAYER_UNREADY]: undefined;
  [SocketEvents.START_GAME]: undefined;
  [SocketEvents.REVEAL_CARD]: undefined;
  [SocketEvents.HIDE_CARD]: undefined;
  [SocketEvents.CALL_POLICE]: CallPolicePayload;
  [SocketEvents.SUBMIT_GUESS]: SubmitGuessPayload;
  [SocketEvents.NEXT_ROUND]: undefined;
  [SocketEvents.END_GAME]: undefined;
  [SocketEvents.RECONNECT]: ReconnectPayload;
  [SocketEvents.CHAT_SEND]: ChatSendPayload;
  [SocketEvents.CHAT_TYPING]: ChatTypingPayload;

  [SocketEvents.ROOM_CREATED]: CreateRoomAckPayload;
  [SocketEvents.ROOM_JOINED]: JoinRoomAckPayload;
  [SocketEvents.ROOM_UPDATED]: RoomUpdatedPayload;
  [SocketEvents.ROOM_DESTROYED]: undefined;
  [SocketEvents.HOST_CHANGED]: HostChangedPayload;
  [SocketEvents.GAME_STARTING]: GameStartingPayload;
  [SocketEvents.CARDS_DISTRIBUTED]: CardsDistributedPayload;
  [SocketEvents.PHASE_CHANGED]: PhaseChangedPayload;
  [SocketEvents.CARD_REVEALED]: RevealCardPayload;
  [SocketEvents.CARD_HIDDEN]: HideCardPayload;
  [SocketEvents.RAJA_REVEALED]: RajaRevealedPayload;
  [SocketEvents.POLICE_REVEALED]: PoliceRevealedPayload;
  [SocketEvents.SHOW_RESULT]: ShowResultPayload;
  [SocketEvents.GUESS_SUBMITTED]: GuessSubmittedPayload;
  [SocketEvents.ROLES_REVEALED]: RolesRevealedPayload;
  [SocketEvents.ROUND_RESULT]: RoundResultPayload;
  [SocketEvents.SCORE_UPDATED]: ScoreUpdatedPayload;
  [SocketEvents.LEADERBOARD_UPDATED]: LeaderboardUpdatedPayload;
  [SocketEvents.NEXT_ROUND_STARTED]: NextRoundStartedPayload;
  [SocketEvents.GAME_OVER]: GameOverPayload;
  [SocketEvents.RECONNECT_STATE]: ReconnectStatePayload;
  [SocketEvents.PLAYER_RECONNECTED]: PlayerReconnectedPayload;
  [SocketEvents.PLAYER_DISCONNECTED]: PlayerDisconnectedPayload;
  [SocketEvents.CHAT_RECEIVE]: ChatReceivePayload;
  [SocketEvents.CHAT_HISTORY]: ChatHistoryPayload;
  [SocketEvents.CHAT_CLEAR]: undefined;
  [SocketEvents.ERROR_MESSAGE]: ErrorMessagePayload;
}
