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
  policeSelect,
  advanceToPhase,
  endGame,
} from "../game/gameEngine.js";

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

export function registerGameHandlers(io: Server) {
  io.on("connection", (socket) => {

    socket.on(SocketEvents.START_GAME, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = startGame(room, player);
      emitResult(room, result, io, socket);
    });

    socket.on(SocketEvents.POLICE_SELECT, ({ chosenId }: { chosenId: string }) => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = policeSelect(room, player, chosenId);
      emitResult(room, result, io, socket);
    });

    socket.on(SocketEvents.END_GAME, () => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const result = endGame(room, player);
      emitResult(room, result, io, socket);
    });
  });
}
