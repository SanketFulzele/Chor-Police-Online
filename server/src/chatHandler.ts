import type { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { getPlayerBySocketId } from "./roomManager.js";
import { SocketEvents } from "../shared/socket/events.js";
import {
  canBroadcastTyping,
  canSendMessage,
  pushChatMessage,
  sanitizeChatText,
} from "./chatManager.js";
import type { ChatMessage } from "./types";

export function registerChatHandlers(io: Server) {
  io.on("connection", (socket) => {
    socket.on(SocketEvents.CHAT_SEND, (payload: { text?: unknown } | undefined) => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      if (room.phase === "finished") return;

      if (!canSendMessage(socket.id)) {
        socket.emit(SocketEvents.ERROR_MESSAGE, {
          message: "Slow down! One message per 700ms.",
          code: "RATE_LIMITED",
        });
        return;
      }

      const text = sanitizeChatText(payload?.text);
      if (!text) return;

      const message: ChatMessage = {
        id: uuidv4(),
        playerId: player.id,
        playerName: player.name,
        avatarColor: player.avatarColor,
        text,
        timestamp: Date.now(),
        isSystem: false,
      };

      pushChatMessage(io, room.code, message);
    });

    socket.on(SocketEvents.CHAT_TYPING, (payload: { isTyping?: unknown } | undefined) => {
      const ctx = getPlayerBySocketId(socket.id);
      if (!ctx) return;

      const { room, player } = ctx;
      const isTyping = payload?.isTyping === true;
      if (!canBroadcastTyping(socket.id, isTyping)) return;

      io.to(room.code).emit(SocketEvents.CHAT_TYPING, {
        playerId: player.id,
        playerName: player.name,
        isTyping,
      });
    });
  });
}
