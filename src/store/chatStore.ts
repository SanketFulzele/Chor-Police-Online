import { create } from "zustand";
import type { ChatMessage } from "../types";

export interface TypingUser {
  playerId: string;
  playerName: string;
  until: number;
}

interface ChatState {
  roomCode: string | null;
  messages: ChatMessage[];
  typingUsers: Record<string, TypingUser>;
  unread: number;
  isCollapsed: boolean;

  receiveMessage: (message: ChatMessage, isOwn: boolean) => void;
  setHistory: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setTyping: (playerId: string, playerName: string, isTyping: boolean) => void;
  pruneTyping: (now: number) => void;
  toggleCollapsed: () => void;
  setRoomCode: (code: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  roomCode: null,
  messages: [],
  typingUsers: {},
  unread: 0,
  isCollapsed: false,

  receiveMessage: (message, isOwn) =>
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) return state;
      return {
        messages: [...state.messages, message],
        unread: state.isCollapsed && !isOwn ? state.unread + 1 : state.unread,
      };
    }),

  setHistory: (messages) => set({ messages, unread: 0, typingUsers: {} }),

  clearMessages: () => set({ messages: [], unread: 0, typingUsers: {} }),

  setTyping: (playerId, playerName, isTyping) =>
    set((state) => {
      const next = { ...state.typingUsers };
      if (isTyping) {
        next[playerId] = { playerId, playerName, until: Date.now() + 2000 };
      } else {
        delete next[playerId];
      }
      return { typingUsers: next };
    }),

  pruneTyping: (now) =>
    set((state) => {
      let changed = false;
      const next = { ...state.typingUsers };
      for (const [id, user] of Object.entries(next)) {
        if (user.until <= now) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? { typingUsers: next } : state;
    }),

  toggleCollapsed: () =>
    set((state) => {
      const nextCollapsed = !state.isCollapsed;
      return {
        isCollapsed: nextCollapsed,
        unread: nextCollapsed ? state.unread : 0,
      };
    }),

  setRoomCode: (code) => set({ roomCode: code }),

  reset: () =>
    set({ roomCode: null, messages: [], typingUsers: {}, unread: 0, isCollapsed: false }),
}));
