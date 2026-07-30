import { create } from "zustand";
import type { ConnectionStatus } from "../types";

interface SocketState {
  socket: ReturnType<typeof import("socket.io-client")["io"]> | null;
  status: ConnectionStatus;
  setSocket: (socket: ReturnType<typeof import("socket.io-client")["io"]>) => void;
  setStatus: (status: ConnectionStatus) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  status: "disconnected",
  setSocket: (socket) => set({ socket, status: "connected" }),
  setStatus: (status) => set({ status }),
  disconnect: () => {
    set((state) => {
      state.socket?.disconnect();
      return { socket: null, status: "disconnected" };
    });
  },
}));
