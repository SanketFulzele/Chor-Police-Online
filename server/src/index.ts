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
  canStartGame,
} from "./roomManager.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

function broadcastRoom(roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) return;
  io.to(roomCode).emit("room-updated", { room });
}

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("create-room", ({ playerName }: { playerName: string }) => {
    if (!playerName || playerName.trim().length < 2) {
      socket.emit("error-message", { message: "Name must be at least 2 characters" });
      return;
    }

    const playerId = uuidv4();
    const room = createRoom(socket.id, playerName.trim(), playerId);

    socket.join(room.code);
    socket.emit("room-created", { roomCode: room.code, playerId, room });
    broadcastRoom(room.code);
  });

  socket.on(
    "join-room",
    ({
      roomCode,
      playerName,
    }: {
      roomCode: string;
      playerName: string;
    }) => {
      if (!playerName || playerName.trim().length < 2) {
        socket.emit("error-message", { message: "Name must be at least 2 characters", code: "INVALID_NAME" });
        return;
      }
      if (!roomCode || roomCode.trim().length < 4) {
        socket.emit("error-message", { message: "Invalid room code", code: "INVALID_CODE" });
        return;
      }

      const playerId = uuidv4();
      const result = joinRoom(roomCode.trim().toUpperCase(), socket.id, playerName.trim(), playerId);

      if (result.error) {
        socket.emit("error-message", { message: result.error, code: "JOIN_FAILED" });
        return;
      }

      socket.join(result.room.code);
      socket.emit("room-joined", { room: result.room, playerId });
      broadcastRoom(result.room.code);
    }
  );

  socket.on("leave-room", () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    const updatedRoom = leaveRoom(room.code, player.id);

    socket.leave(room.code);

    if (updatedRoom) {
      broadcastRoom(room.code);
    } else {
      io.to(room.code).emit("room-destroyed");
    }
  });

  socket.on("player-ready", () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    const updated = togglePlayerReady(room.code, player.id);
    if (updated) {
      broadcastRoom(room.code);
    }
  });

  socket.on("player-unready", () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    if (!player.isReady) return;
    const updated = togglePlayerReady(room.code, player.id);
    if (updated) {
      broadcastRoom(room.code);
    }
  });

  socket.on("start-game", () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    if (!player.isHost) {
      socket.emit("error-message", { message: "Only the host can start the game" });
      return;
    }
    if (!canStartGame(room)) {
      socket.emit("error-message", { message: "Need 4 players, all ready" });
      return;
    }

    room.phase = "shuffling";
    room.round = 1;
    broadcastRoom(room.code);

    io.to(room.code).emit("game-starting", { room });
  });

  socket.on("disconnecting", () => {
    const ctx = getPlayerBySocketId(socket.id);
    if (!ctx) return;

    const { room, player } = ctx;
    const updatedRoom = setPlayerDisconnected(room.code, player.id);

    if (updatedRoom) {
      if (player.isHost) {
        io.to(room.code).emit("host-changed", { newHostId: updatedRoom.hostId });
      }
      broadcastRoom(room.code);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
