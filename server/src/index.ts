import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  getPlayerBySocketId,
  togglePlayerReady,
  setPlayerDisconnected,
  updatePlayerSocket,
} from "./roomManager.js";
import { registerGameHandlers } from "./gameHandler.js";
import { SocketEvents } from "../shared/socket/events.js";

const app = express();
const httpServer = createServer(app);
const ALLOWED_ORIGINS = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "https://chor-police-game-online.vercel.app"];

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

function broadcastRoom(roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) return;
  console.log(`[broadcast] room=${roomCode} players=${room.players.length} phase=${room.phase}`);
  io.to(roomCode).emit(SocketEvents.ROOM_UPDATED, { room });
}

const GRACE_PERIOD_MS = 30_000;
const disconnectTimers = new Map<string, NodeJS.Timeout>();

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on(SocketEvents.CREATE_ROOM, ({ playerName }: { playerName: string }) => {
    console.log(`[event] CREATE_ROOM socket=${socket.id} name="${playerName}"`);
    if (!playerName || playerName.trim().length < 2) {
      socket.emit(SocketEvents.ERROR_MESSAGE, { message: "Name must be at least 2 characters" });
      return;
    }

    const playerId = uuidv4();
    const room = createRoom(socket.id, playerName.trim(), playerId);

    socket.join(room.code);
    socket.emit(SocketEvents.ROOM_CREATED, { roomCode: room.code, playerId, room });
    broadcastRoom(room.code);
  });

  socket.on(
    SocketEvents.JOIN_ROOM,
    ({
      roomCode,
      playerName,
    }: {
      roomCode: string;
      playerName: string;
    }) => {
      if (!playerName || playerName.trim().length < 2) {
        socket.emit(SocketEvents.ERROR_MESSAGE, { message: "Name must be at least 2 characters", code: "INVALID_NAME" });
        return;
      }
      if (!roomCode || roomCode.trim().length < 4) {
        socket.emit(SocketEvents.ERROR_MESSAGE, { message: "Invalid room code", code: "INVALID_CODE" });
        return;
      }

      const playerId = uuidv4();
      console.log(`[event] JOIN_ROOM socket=${socket.id} code="${roomCode}" name="${playerName}"`);
      const result = joinRoom(roomCode.trim().toUpperCase(), socket.id, playerName.trim(), playerId);

      if (result.error) {
        socket.emit(SocketEvents.ERROR_MESSAGE, { message: result.error, code: "JOIN_FAILED" });
        return;
      }

      socket.join(result.room.code);
      console.log(`[join] socket=${socket.id} joined room=${result.room.code} players=${result.room.players.length}`);
      socket.emit(SocketEvents.ROOM_JOINED, { room: result.room, playerId });
      broadcastRoom(result.room.code);
    }
  );

  socket.on(SocketEvents.LEAVE_ROOM, () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    const updatedRoom = leaveRoom(room.code, player.id);

    socket.leave(room.code);

    if (updatedRoom) {
      broadcastRoom(room.code);
    } else {
      io.to(room.code).emit(SocketEvents.ROOM_DESTROYED);
    }
  });

  socket.on(SocketEvents.RECONNECT, ({ roomCode, playerId }: { roomCode: string; playerId: string }) => {
    const room = getRoom(roomCode?.toUpperCase());
    if (!room) {
      socket.emit(SocketEvents.ERROR_MESSAGE, { message: "Room not found", code: "ROOM_NOT_FOUND" });
      return;
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      console.log(`[event] RECONNECT socket=${socket.id} FAILED: player ${playerId} not found in room ${roomCode}`);
      socket.emit(SocketEvents.ERROR_MESSAGE, { message: "Player not found in room", code: "PLAYER_NOT_FOUND" });
      return;
    }

    const key = `${roomCode}:${playerId}`;
    const existing = disconnectTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      disconnectTimers.delete(key);
      console.log(`[event] RECONNECT cancelled disconnect timer for ${player.name} in ${roomCode}`);
    }

    console.log(`[event] RECONNECT socket=${socket.id} room=${roomCode} player=${player.name} wasHost=${player.isHost} wasConnected=${player.isConnected}`);
    updatePlayerSocket(room.code, player.id, socket.id);
    socket.join(room.code);
    socket.emit(SocketEvents.RECONNECT_STATE, { room, playerId, myRole: player.currentRole });
    io.to(room.code).emit(SocketEvents.PLAYER_RECONNECTED, { playerId: player.id });
    io.to(room.code).emit(SocketEvents.ROOM_UPDATED, { room });
  });

  socket.on(SocketEvents.PLAYER_READY, () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    console.log(`[event] PLAYER_READY socket=${socket.id} player=${player.name} room=${room.code}`);
    const updated = togglePlayerReady(room.code, player.id);
    if (updated) {
      broadcastRoom(room.code);
    }
  });

  socket.on(SocketEvents.PLAYER_UNREADY, () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    if (!player.isReady) return;
    const updated = togglePlayerReady(room.code, player.id);
    if (updated) {
      broadcastRoom(room.code);
    }
  });

  socket.on("disconnecting", () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) {
      console.log(`[event] disconnecting socket=${socket.id} (no player found — likely old socket after RECONNECT)`);
      return;
    }

    const { room, player } = ctx;
    console.log(`[event] disconnecting socket=${socket.id} player=${player.name} room=${room.code}`);

    const wasHost = player.isHost;
    const key = `${room.code}:${player.id}`;
    const timer = setTimeout(() => {
      if (!disconnectTimers.has(key)) {
        console.log(`[timer] race avoided for ${player.name} in ${room.code} (already reconnected)`);
        return;
      }
      disconnectTimers.delete(key);
      console.log(`[timer] executing disconnect for ${player.name} in ${room.code}`);
      const updatedRoom = setPlayerDisconnected(room.code, player.id);
      if (updatedRoom) {
        io.to(room.code).emit(SocketEvents.PLAYER_DISCONNECTED, { playerId: player.id });
        if (wasHost) {
          console.log(`[timer] host transferred from ${player.name} to ${updatedRoom.hostId} in ${room.code}`);
          io.to(room.code).emit(SocketEvents.HOST_CHANGED, { newHostId: updatedRoom.hostId });
        }
        broadcastRoom(room.code);
      }
    }, GRACE_PERIOD_MS);
    disconnectTimers.set(key, timer);
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

registerGameHandlers(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
