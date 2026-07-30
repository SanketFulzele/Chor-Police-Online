import { create } from "zustand";
import type { Room } from "../types";

interface RoomState {
  room: Room | null;
  playerId: string | null;
  setRoom: (room: Room | null) => void;
  setPlayerId: (id: string | null) => void;
  updatePlayer: (playerId: string, updates: Partial<Room["players"][0]>) => void;
  reset: () => void;
}

function sanitizeRoom(room: Room | null): Room | null {
  if (!room) return null;
  return {
    ...room,
    players: room.players.map((p) => ({ ...p })),
    roundHistory: room.roundHistory.map((r) => ({ ...r })),
  };
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  playerId: null,
  setRoom: (room) => set({ room: sanitizeRoom(room) }),
  setPlayerId: (id) => set({ playerId: id }),
  updatePlayer: (playerId, updates) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          ),
        },
      };
    }),
  reset: () => set({ room: null, playerId: null }),
}));
