import type { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage } from "./types";
import { SocketEvents } from "../shared/socket/events.js";

export const CHAT_MAX_LENGTH = 200;
export const CHAT_RATE_LIMIT_MS = 700;
const TYPING_THROTTLE_MS = 1000;

const chats = new Map<string, ChatMessage[]>();
const lastMessageAt = new Map<string, number>();
const lastTypingAt = new Map<string, number>();

export function getChatHistory(roomCode: string): ChatMessage[] {
  return chats.get(roomCode) ?? [];
}

function stripControlChars(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code >= 32 || code === 10) out += ch;
  }
  return out;
}

export function sanitizeChatText(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return stripControlChars(raw)
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, CHAT_MAX_LENGTH);
}

function append(roomCode: string, message: ChatMessage): ChatMessage {
  const list = chats.get(roomCode) ?? [];
  list.push(message);
  chats.set(roomCode, list);
  return message;
}

export function pushChatMessage(io: Server, roomCode: string, message: ChatMessage): ChatMessage {
  append(roomCode, message);
  io.to(roomCode).emit(SocketEvents.CHAT_RECEIVE, { message });
  return message;
}

export function pushSystemMessage(io: Server, roomCode: string, text: string): ChatMessage {
  return pushChatMessage(io, roomCode, {
    id: uuidv4(),
    playerId: "system",
    playerName: "System",
    avatarColor: "#7c3aed",
    text,
    timestamp: Date.now(),
    isSystem: true,
  });
}

export function clearChat(roomCode: string): void {
  chats.set(roomCode, []);
}

export function deleteChat(roomCode: string): void {
  chats.delete(roomCode);
}

export function cleanupChatSocket(socketId: string): void {
  lastMessageAt.delete(socketId);
  lastTypingAt.delete(socketId);
}

export function canSendMessage(socketId: string): boolean {
  const now = Date.now();
  const last = lastMessageAt.get(socketId) ?? 0;
  if (now - last < CHAT_RATE_LIMIT_MS) return false;
  lastMessageAt.set(socketId, now);
  return true;
}

export function canBroadcastTyping(socketId: string, isTyping: boolean): boolean {
  if (!isTyping) return true;
  const now = Date.now();
  const last = lastTypingAt.get(socketId) ?? 0;
  if (now - last < TYPING_THROTTLE_MS) return false;
  lastTypingAt.set(socketId, now);
  return true;
}
