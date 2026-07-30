import { useCallback } from "react";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";

export function useRoom() {
  const socket = useSocketStore((s) => s.socket);
  const { room, playerId, setRoom, setPlayerId, reset } = useRoomStore();

  const createRoom = useCallback(
    (playerName: string) => {
      if (!socket) return;
      socket.emit("create-room", { playerName });

      socket.once("room-created", ({ roomCode, playerId: id, room: r }) => {
        setPlayerId(id);
        setRoom(r);
        return { roomCode, playerId: id };
      });
    },
    [socket, setRoom, setPlayerId]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        if (!socket) {
          resolve({ success: false, error: "Not connected to server" });
          return;
        }

        socket.emit("join-room", { roomCode, playerName });

        socket.once("room-joined", ({ room: r, playerId: id }) => {
          setPlayerId(id);
          setRoom(r);
          resolve({ success: true });
        });

        socket.once("error-message", ({ message }) => {
          resolve({ success: false, error: message });
        });
      });
    },
    [socket, setRoom, setPlayerId]
  );

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit("leave-room");
    reset();
  }, [socket, reset]);

  const toggleReady = useCallback(() => {
    if (!socket) return;
    const player = room?.players.find((p) => p.id === playerId);
    if (player?.isReady) {
      socket.emit("player-unready");
    } else {
      socket.emit("player-ready");
    }
  }, [socket, room, playerId]);

  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit("start-game");
  }, [socket]);

  return {
    room,
    playerId,
    myPlayer: room?.players.find((p) => p.id === playerId) ?? null,
    isHost: room?.players.find((p) => p.id === playerId)?.isHost ?? false,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
  };
}
