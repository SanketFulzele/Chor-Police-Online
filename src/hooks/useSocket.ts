import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { SocketEvents } from "../../shared/socket/events";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

if (!SERVER_URL) {
  throw new Error(
    "[useSocket] VITE_SERVER_URL environment variable is not configured. " +
    "Set it in .env or in your deployment environment variables."
  );
}

export function useSocket() {
  const socket = useSocketStore((s) => s.socket);
  const setSocket = useSocketStore((s) => s.setSocket);
  const setStatus = useSocketStore((s) => s.setStatus);
  const setRoom = useRoomStore((s) => s.setRoom);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || socket?.connected) return;
    initialized.current = true;

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

    newSocket.on(SocketEvents.ROOM_UPDATED, ({ room }) => {
      setRoom(room);
    });

    newSocket.on(SocketEvents.ROOM_DESTROYED, () => {
      useRoomStore.getState().reset();
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off(SocketEvents.ROOM_UPDATED);
      newSocket.off(SocketEvents.ROOM_DESTROYED);
    };
  }, [setSocket, setStatus, setRoom, socket?.connected]);
}
