import type { Server } from "socket.io";
import type { Room } from "./types";
import { getRoom, getPlayerBySocketId } from "./roomManager.js";
import { SocketEvents } from "../shared/socket/events.js";
import { clearChat, pushSystemMessage } from "./chatManager.js";
import type {
  EngineResult,
  ScheduledEvent,
} from "../game/gameEngine";
import {
  startGame,
  revealCard,
  hideCard,
  callPolice,
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
      const wasFinished = room.phase === "finished";
      const result = startGame(room, player);
      emitResult(room, result, io, socket);
      if (result.ok) {
        clearChat(room.code);
        io.to(room.code).emit(SocketEvents.CHAT_CLEAR);
        pushSystemMessage(io, room.code, wasFinished ? "🔄 New Game Started." : "🎮 Game Started.");
      }
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

    // ========== CALL POLICE ==========

    socket.on(SocketEvents.CALL_POLICE, (_payload?: unknown) => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = callPolice(room, player);
      emitResult(room, result, io, socket);
      if (result.ok) {
        pushSystemMessage(io, room.code, "👮 Police is choosing the Chor...");
      }
    });

    // ========== SUBMIT GUESS ==========

    socket.on(SocketEvents.SUBMIT_GUESS, ({ chosenId }: { chosenId: string }) => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = submitGuess(room, player, chosenId);
      emitResult(room, result, io, socket);
      if (result.ok) {
        const last = room.roundHistory[room.roundHistory.length - 1];
        pushSystemMessage(
          io,
          room.code,
          last?.isCorrect ? "🏆 Police found the Chor!" : "❌ Police got it wrong! The Chor escaped."
        );
      }
    });

    // ========== NEXT ROUND ==========

    socket.on(SocketEvents.NEXT_ROUND, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = nextRound(room, player);
      emitResult(room, result, io, socket);
      if (result.ok) {
        pushSystemMessage(io, room.code, `🔁 Round ${room.round} Started.`);
      }
    });

    // ========== END GAME ==========

    socket.on(SocketEvents.END_GAME, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = endGame(room, player);
      emitResult(room, result, io, socket);
      if (result.ok) {
        pushSystemMessage(io, room.code, `🏆 ${room.winnerName ?? "Winner"} won the game!`);
      }
    });
  });
}
