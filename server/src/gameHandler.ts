import type { Server } from "socket.io";
import type { Room } from "./types";
import { getRoom, getPlayerBySocketId } from "./roomManager.js";
import { SocketEvents } from "../shared/socket/events.js";
import type {
  EngineResult,
  ScheduledEvent,
} from "../game/gameEngine";
import {
  startGame,
  revealCard,
  hideCard,
  callMantri,
  submitGuess,
  nextRound,
  advanceToPhase,
  endGame,
} from "../game/gameEngine.js";

// ---- Emit helper ----

function emitResult(room: Room, result: EngineResult, io: Server, errorSocket?: { emit: (event: string, data: unknown) => void }) {
  if (!result.ok) {
    if (errorSocket) {
      errorSocket.emit(SocketEvents.ERROR_MESSAGE, result.error);
    }
    return;
  }

  io.to(room.code).emit(SocketEvents.ROOM_UPDATED, { room });

  for (const evt of result.events) {
    io.to(room.code).emit(evt.event, evt.payload);
  }

  for (const te of result.targetedEvents) {
    const player = room.players.find((p) => p.id === te.playerId);
    if (player) {
      io.to(player.socketId).emit(te.event, te.payload);
    }
  }

  for (const se of result.schedule ?? []) {
    scheduleOrApply(room, se, io);
  }
}

function scheduleOrApply(room: Room, se: ScheduledEvent, io: Server) {
  const apply = () => {
    const currentRoom = getRoom(room.code);
    if (!currentRoom || currentRoom.phase !== se.fromPhase) return;

    const nextResult = advanceToPhase(currentRoom, se.phase);
    for (const evt of se.events) {
      nextResult.events.push(evt);
    }
    emitResult(currentRoom, nextResult, io);
  };

  if (se.delay === 0) {
    apply();
  } else {
    setTimeout(apply, se.delay);
  }
}

// ---- Game event handler ----

export function registerGameHandlers(io: Server) {
  io.on("connection", (socket) => {

    // ========== START GAME ==========

    socket.on(SocketEvents.START_GAME, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = startGame(room, player);
      emitResult(room, result, io, socket);
    });

    // ========== REVEAL CARD ==========

    socket.on(SocketEvents.REVEAL_CARD, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = revealCard(room, player);
      emitResult(room, result, io, socket);
    });

    // ========== HIDE CARD ==========

    socket.on(SocketEvents.HIDE_CARD, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = hideCard(room, player);
      emitResult(room, result, io, socket);
    });

    // ========== CALL MANTRI ==========

    socket.on(SocketEvents.CALL_MANTRI, (_payload?: unknown) => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = callMantri(room, player);
      emitResult(room, result, io, socket);
    });

    // ========== SUBMIT GUESS ==========

    socket.on(SocketEvents.SUBMIT_GUESS, ({ chosenId }: { chosenId: string }) => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = submitGuess(room, player, chosenId);
      emitResult(room, result, io, socket);
    });

    // ========== NEXT ROUND ==========

    socket.on(SocketEvents.NEXT_ROUND, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = nextRound(room, player);
      emitResult(room, result, io, socket);
    });

    // ========== END GAME ==========

    socket.on(SocketEvents.END_GAME, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = endGame(room, player);
      emitResult(room, result, io, socket);
    });
  });
}
