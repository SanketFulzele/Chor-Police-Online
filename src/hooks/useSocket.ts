import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { SocketEvents } from "../../shared/socket/events";
import type { Room } from "../types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

if (!SERVER_URL) {
  throw new Error(
    "[useSocket] VITE_SERVER_URL environment variable is not configured. " +
    "Set it in .env or in your deployment environment variables."
  );
}

let socketCreated = false;

export function useSocket() {
  const socket = useSocketStore((s) => s.socket);
  const setSocket = useSocketStore((s) => s.setSocket);
  const setStatus = useSocketStore((s) => s.setStatus);

  useEffect(() => {
    if (socket?.connected || socketCreated) return;
    socketCreated = true;

    setStatus("connecting");

    const newSocket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      setStatus("connected");
    });

    newSocket.on("disconnect", () => {
      setStatus("disconnected");
    });

    newSocket.on("connect_error", () => {
      setStatus("disconnected");
    });

    newSocket.on(SocketEvents.ROOM_UPDATED, ({ room }: { room: Room }) => {
      useRoomStore.getState().setRoom(room);
    });

    newSocket.on(SocketEvents.ROOM_DESTROYED, () => {
      useRoomStore.getState().reset();
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      socketCreated = false;
    };
  }, [setSocket, setStatus]);
}
