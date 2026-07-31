import { useCallback } from "react";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { SocketEvents } from "../../shared/socket/events";
import { clearSession } from "../utils/session";

export function useRoom() {
  const socket = useSocketStore((s) => s.socket);
  const { room, playerId, setRoom, setPlayerId, reset } = useRoomStore();

  const createRoom = useCallback(
    (playerName: string) => {
      if (!socket) return;
      socket.emit(SocketEvents.CREATE_ROOM, { playerName });

      socket.once(SocketEvents.ROOM_CREATED, ({ roomCode, playerId: id, room: r }) => {
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

        socket.emit(SocketEvents.JOIN_ROOM, { roomCode, playerName });

        socket.once(SocketEvents.ROOM_JOINED, ({ room: r, playerId: id }) => {
          setPlayerId(id);
          setRoom(r);
          resolve({ success: true });
        });

        socket.once(SocketEvents.ERROR_MESSAGE, ({ message }) => {
          resolve({ success: false, error: message });
        });
      });
    },
    [socket, setRoom, setPlayerId]
  );

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit(SocketEvents.LEAVE_ROOM);
    clearSession();
    reset();
  }, [socket, reset]);

  const toggleReady = useCallback(() => {
    if (!socket) return;
    const player = room?.players.find((p) => p.id === playerId);
    const targetReady = !(player?.isReady ?? false);
    useRoomStore.getState().updatePlayer(playerId, { isReady: targetReady });
    socket.emit(
      targetReady ? SocketEvents.PLAYER_READY : SocketEvents.PLAYER_UNREADY
    );
  }, [socket, room, playerId]);

  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit(SocketEvents.START_GAME);
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
