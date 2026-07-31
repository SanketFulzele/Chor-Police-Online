import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { useGameStore } from "../store/gameStore";
import { SocketEvents } from "../../shared/socket/events";
import type { Room, GameRole } from "../types";
import { loadSession, clearSession } from "../utils/session";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function isLocalOrPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") return true;
    if (host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("169.254.")) return true;
    if (host.startsWith("172.")) {
      const second = Number(host.split(".")[1]);
      if (second >= 16 && second <= 31) return true;
    }
    return false;
  } catch {
    return true;
  }
}

if (!SERVER_URL) {
  throw new Error(
    "[useSocket] VITE_SERVER_URL environment variable is not configured. " +
    "Set it in your Vercel project settings (Production + Preview) to the deployed " +
    "backend URL (e.g. https://your-backend.onrender.com) and rebuild."
  );
}

if (import.meta.env.PROD && isLocalOrPrivateUrl(SERVER_URL)) {
  throw new Error(
    `[useSocket] VITE_SERVER_URL points to a local/private address (${SERVER_URL}) in a production build. ` +
    "Set VITE_SERVER_URL to your deployed backend URL in the Vercel environment variables and rebuild. " +
    "Players on other networks can never reach localhost / LAN addresses."
  );
}

let socketCreated = false;

function reconstructGameState(room: Room, myRole?: GameRole) {
  const gameStore = useGameStore.getState();
  const playerId = useRoomStore.getState().playerId;

  gameStore.setShuffling(false);
  gameStore.setPhase(room.phase);
  gameStore.setRound(room.round);
  if (myRole) gameStore.setMyRole(myRole);
  if (room.mantriId) gameStore.setMantriId(room.mantriId);

  const scores: Record<string, number> = {};
  const totals: Record<string, number> = {};
  let me: Room["players"][number] | undefined;
  for (const p of room.players) {
    scores[p.id] = p.currentScore;
    totals[p.id] = p.totalScore;
    if (p.hasRevealed) gameStore.addRevealedPlayer(p.id);
    if (p.hasHidden) gameStore.addHiddenPlayer(p.id);
    if (p.id === playerId) me = p;
  }
  if (me) {
    gameStore.setHasRevealed(me.hasRevealed);
    gameStore.setHasHidden(me.hasHidden);
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
      // Polling-first. Plain HTTPS long-polling works on every network (mobile
      // carriers, carrier NATs, restrictive proxies); the connection then
      // transparently upgrades to WebSocket when the network allows it. A
      // websocket-first config fails on networks that block the upgrade
      // handshake, which is the classic "works on Wi-Fi, fails on 4G/5G" cause.
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      // Generous initial timeout so Render cold starts (after idle spin-down)
      // do not fail the very first connection attempt.
      timeout: 30000,
    });

    newSocket.io.on("reconnect_attempt", (attempt: number) => {
      console.log(`[socket] reconnect attempt #${attempt} -> ${SERVER_URL}`);
    });
    newSocket.io.on("reconnect_error", (err: Error) => {
      console.error(`[socket] reconnect_error: ${err.message}`);
    });
    newSocket.io.on("error", (err: Error) => {
      console.error(`[socket] manager error: ${err.message}`);
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

    newSocket.on("connect_error", (rawErr: Error) => {
      const err = rawErr as Error & { description?: string; context?: unknown };
      console.error(
        `[socket] connect_error: ${err.message}${err.description ? ` — ${err.description}` : ""}`,
        err.context ?? ""
      );
      setStatus("disconnected");
    });

    newSocket.on(SocketEvents.ROOM_UPDATED, ({ room }: { room: Room }) => {
      console.log(`[socket] ROOM_UPDATED room=${room.code} players=${room.players.length} phase=${room.phase} round=${room.round}`);
      useRoomStore.getState().setRoom(room);
      useGameStore.getState().setRound(room.round);
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
