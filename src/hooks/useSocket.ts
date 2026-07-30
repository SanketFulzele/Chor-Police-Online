import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { useGameStore } from "../store/gameStore";
import { SocketEvents } from "../../shared/socket/events";
import type { Room, GameRole } from "../types";
import { loadSession, clearSession } from "../utils/session";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

if (!SERVER_URL) {
  throw new Error(
    "[useSocket] VITE_SERVER_URL environment variable is not configured. " +
    "Set it in .env or in your deployment environment variables."
  );
}

let socketCreated = false;

function reconstructGameState(room: Room, myRole?: GameRole) {
  const gameStore = useGameStore.getState();

  gameStore.setPhase(room.phase);
  gameStore.setRound(room.round);
  if (myRole) gameStore.setMyRole(myRole);
  if (room.mantriId) gameStore.setMantriId(room.mantriId);

  const scores: Record<string, number> = {};
  const totals: Record<string, number> = {};
  for (const p of room.players) {
    scores[p.id] = p.currentScore;
    totals[p.id] = p.totalScore;
    if (p.hasRevealed) gameStore.addRevealedPlayer(p.id);
    if (p.hasHidden) gameStore.addHiddenPlayer(p.id);
  }
  gameStore.setCurrentScores(scores);
  gameStore.setCurrentTotals(totals);

  if (room.phase === "finished" && room.winnerId) {
    const lb = room.players
      .map((p) => ({ playerId: p.id, name: p.name, score: p.totalScore }))
      .sort((a, b) => b.score - a.score);
    const stats: Record<string, unknown> = {};
    for (const p of room.players) {
      stats[p.id] = p.statistics;
    }
    gameStore.setGameOver({
      winnerId: room.winnerId,
      winnerName: room.winnerName ?? "",
      leaderboard: lb,
      playerStatistics: stats,
      roundHistory: room.roundHistory ?? [],
    });
  }
}

export function useSocket() {
  const socket = useSocketStore((s) => s.socket);
  const setSocket = useSocketStore((s) => s.setSocket);
  const setStatus = useSocketStore((s) => s.setStatus);

  useEffect(() => {
    if (socket?.connected || socketCreated) return;
    socketCreated = true;

    setStatus("connecting");

    const newSocket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      console.log(`[socket] connected id=${newSocket.id}`);
      setStatus("connected");

      const { room, playerId } = useRoomStore.getState();
      if (room && playerId) {
        console.log(`[socket] emitting RECONNECT room=${room.code} playerId=${playerId}`);
        newSocket.emit(SocketEvents.RECONNECT, {
          roomCode: room.code,
          playerId,
        });
        return;
      }

      const session = loadSession();
      if (session) {
        console.log(`[socket] session found, emitting RECONNECT room=${session.roomCode} playerId=${session.playerId}`);
        useRoomStore.getState().setPlayerId(session.playerId);
        newSocket.emit(SocketEvents.RECONNECT, {
          roomCode: session.roomCode,
          playerId: session.playerId,
        });
      }
    });

    newSocket.on("disconnect", () => {
      console.log(`[socket] disconnected id=${newSocket.id}`);
      setStatus("disconnected");
    });

    newSocket.on("connect_error", () => {
      console.log(`[socket] connect_error id=${newSocket.id}`);
      setStatus("disconnected");
    });

    newSocket.on(SocketEvents.ROOM_UPDATED, ({ room }: { room: Room }) => {
      console.log(`[socket] ROOM_UPDATED room=${room.code} players=${room.players.length} phase=${room.phase}`);
      useRoomStore.getState().setRoom(room);
    });

    newSocket.on(SocketEvents.ROOM_DESTROYED, () => {
      console.log(`[socket] ROOM_DESTROYED`);
      clearSession();
      useRoomStore.getState().reset();
    });

    newSocket.on(SocketEvents.PLAYER_RECONNECTED, ({ playerId }: { playerId: string }) => {
      console.log(`[socket] PLAYER_RECONNECTED playerId=${playerId}`);
      const room = useRoomStore.getState().room;
      if (room) {
        useRoomStore.getState().setRoom({ ...room, players: [...room.players] });
      }
    });

    newSocket.on(SocketEvents.RECONNECT_STATE, ({ room, playerId, myRole }: { room: Room; playerId: string; myRole?: GameRole }) => {
      console.log(`[socket] RECONNECT_STATE room=${room.code} players=${room.players.length} myRole=${myRole}`);
      useRoomStore.getState().setRoom(room);
      useRoomStore.getState().setPlayerId(playerId);
      reconstructGameState(room, myRole);
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      socketCreated = false;
    };
  }, [setSocket, setStatus]);
}
