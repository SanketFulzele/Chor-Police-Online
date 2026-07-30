import type { Player, Room } from "./types";

const rooms = new Map<string, Room>();

const AVATAR_COLORS = [
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

let colorIndex = 0;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getNextColor(): string {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  colorIndex++;
  return color;
}

export function createRoom(
  hostSocketId: string,
  hostName: string,
  hostId: string
): Room {
  let code = generateCode();
  while (rooms.has(code)) {
    code = generateCode();
  }

  const now = Date.now();
  const room: Room = {
    code,
    hostId,
    phase: "waiting",
    round: 0,
    players: [
      {
        id: hostId,
        socketId: hostSocketId,
        name: hostName,
        isHost: true,
        isConnected: true,
        isReady: false,
        avatarColor: getNextColor(),
        joinedAt: now,
        roleHistory: [],
        currentScore: 0,
        totalScore: 0,
        hasRevealed: false,
        hasHidden: false,
        publicRole: undefined,
        statistics: {
          gamesPlayed: 0,
          wins: 0,
          highestScore: 0,
          totalScore: 0,
          timesRaja: 0,
          timesMantri: 0,
          timesChor: 0,
          timesDaku: 0,
          correctGuesses: 0,
          wrongGuesses: 0,
          averageScore: 0,
        },
      },
    ],
    createdAt: now,
    roundHistory: [],
  };

  rooms.set(code, room);
  return room;
}

export function joinRoom(
  code: string,
  socketId: string,
  playerName: string,
  playerId: string
): { room: Room; error?: string } {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { room: null as unknown as Room, error: "Room not found" };
  }
  if (room.phase !== "waiting") {
    return { room: null as unknown as Room, error: "Game already started" };
  }
  if (room.players.length >= 4) {
    return { room: null as unknown as Room, error: "Room is full" };
  }
  if (room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
    return { room: null as unknown as Room, error: "Name already taken" };
  }

  const now = Date.now();
  const player: Player = {
    id: playerId,
    socketId,
    name: playerName,
    isHost: false,
    isConnected: true,
    isReady: false,
    avatarColor: getNextColor(),
    joinedAt: now,
      roleHistory: [],
      currentScore: 0,
      totalScore: 0,
      hasRevealed: false,
      hasHidden: false,
      publicRole: undefined,
      statistics: {
        gamesPlayed: 0,
        wins: 0,
      highestScore: 0,
      totalScore: 0,
      timesRaja: 0,
      timesMantri: 0,
      timesChor: 0,
      timesDaku: 0,
      correctGuesses: 0,
      wrongGuesses: 0,
      averageScore: 0,
    },
  };

  room.players.push(player);
  return { room };
}

export function leaveRoom(code: string, playerId: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(code);
    return null;
  }

  if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
    room.players[0].isHost = true;
  }

  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) {
      return room;
    }
  }
  return undefined;
}

export function getPlayerBySocketId(
  socketId: string
): { room: Room; player: Player } | null {
  for (const room of rooms.values()) {
    const player = room.players.find((p) => p.socketId === socketId);
    if (player) return { room, player };
  }
  return null;
}

export function togglePlayerReady(code: string, playerId: string): Room | null {
  const room = rooms.get(code);
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.isReady = !player.isReady;
  return room;
}

export function updatePlayerSocket(
  code: string,
  playerId: string,
  socketId: string
): Room | null {
  const room = rooms.get(code);
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.socketId = socketId;
  player.isConnected = true;
  return room;
}

export function setPlayerDisconnected(
  code: string,
  playerId: string
): Room | null {
  const room = rooms.get(code);
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.isConnected = false;

  if (room.hostId === playerId && room.players.length > 1) {
    const nextHost = room.players.find((p) => p.id !== playerId && p.isConnected);
    if (nextHost) {
      room.hostId = nextHost.id;
      nextHost.isHost = true;
      player.isHost = false;
    }
  }

  return room;
}

export function destroyRoom(code: string): void {
  rooms.delete(code);
}

export function canStartGame(room: Room): boolean {
  return (
    room.players.length === 4 &&
    room.players.every((p) => p.isReady || p.isHost)
  );
}
