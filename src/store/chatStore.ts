import { create } from "zustand";
import type { ChatMessage } from "../types";

export interface TypingUser {
  playerId: string;
  playerName: string;
  until: number;
}

interface ChatState {
  messages: ChatMessage[];
  typingUsers: Record<string, TypingUser>;
  unread: number;
  isCollapsed: boolean;

  receiveMessage: (message: ChatMessage) => void;
  setHistory: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setTyping: (playerId: string, playerName: string, isTyping: boolean) => void;
  pruneTyping: (now: number) => void;
  toggleCollapsed: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  typingUsers: {},
  unread: 0,
  isCollapsed: false,

  receiveMessage: (message) =>
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) return state;
      return {
        messages: [...state.messages, message],
        unread: state.isCollapsed ? state.unread + 1 : state.unread,
      };
    }),

  setHistory: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

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

  reset: () => set({ messages: [], typingUsers: {}, unread: 0, isCollapsed: false }),
}));
