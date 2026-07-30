import { useEffect } from "react";
import { useSocketStore } from "../store/socketStore";
import { useGameStore } from "../store/gameStore";
import { useRoomStore } from "../store/roomStore";
import { SocketEvents } from "../../shared/socket/events";
import type { GameRole, GamePhase } from "../types";

export function useGame() {
  const socket = useSocketStore((s) => s.socket);
  const setMyRole = useGameStore((s) => s.setMyRole);
  const setPhase = useGameStore((s) => s.setPhase);
  const setRound = useGameStore((s) => s.setRound);
  const setRajaId = useGameStore((s) => s.setRajaId);
  const setMantriId = useGameStore((s) => s.setMantriId);
  const setSelectionResult = useGameStore((s) => s.setSelectionResult);
  const setGameOver = useGameStore((s) => s.setGameOver);

  useEffect(() => {
    if (!socket) return;

    const handleGameStarting = () => {
      setPhase("role-assignment");
    };

    const handleCardsDistributed = (payload: { role?: string; phase?: string }) => {
      if (payload.role) setMyRole(payload.role as GameRole);
      if (payload.phase) setPhase(payload.phase as GamePhase);
    };

    const handlePhaseChanged = (payload: {
      phase?: string;
      rajaId?: string;
      mantriId?: string;
    }) => {
      if (payload.phase) setPhase(payload.phase as GamePhase);
      if (payload.rajaId) setRajaId(payload.rajaId);
      if (payload.mantriId) setMantriId(payload.mantriId);
    };

    const handlePoliceSelected = (payload: {
      chosenId?: string;
      chorId?: string;
      isCorrect?: boolean;
    }) => {
      if (payload.chosenId !== undefined && payload.chorId !== undefined) {
        setSelectionResult({
          chosenId: payload.chosenId,
          chorId: payload.chorId,
          isCorrect: payload.isCorrect ?? false,
        });
      }
    };

    const handleGameOver = (payload: {
      winnerId?: string;
      winnerName?: string;
      leaderboard?: { playerId: string; name: string; score: number }[];
      playerStatistics?: Record<string, unknown>;
      roundHistory?: {
        roundNumber: number;
        roles: Record<string, GameRole>;
        mantriId: string;
        chosenId: string;
        isCorrect: boolean;
        scores: Record<string, number>;
      }[];
    }) => {
      if (payload.winnerId && payload.leaderboard) {
        setGameOver({
          winnerId: payload.winnerId,
          winnerName: payload.winnerName ?? "",
          leaderboard: payload.leaderboard,
          playerStatistics: payload.playerStatistics ?? {},
          roundHistory: payload.roundHistory ?? [],
        });
      }
    };

    const handleRoomUpdated = () => {
      const currentRoom = useRoomStore.getState().room;
      if (currentRoom?.phase) setPhase(currentRoom.phase);
    };

    socket.on(SocketEvents.GAME_STARTING, handleGameStarting);
    socket.on(SocketEvents.CARDS_DISTRIBUTED, handleCardsDistributed);
    socket.on(SocketEvents.PHASE_CHANGED, handlePhaseChanged);
    socket.on(SocketEvents.POLICE_SELECTED, handlePoliceSelected);
    socket.on(SocketEvents.GAME_OVER, handleGameOver);
    socket.on(SocketEvents.ROOM_UPDATED, handleRoomUpdated);

    return () => {
      socket.off(SocketEvents.GAME_STARTING, handleGameStarting);
      socket.off(SocketEvents.CARDS_DISTRIBUTED, handleCardsDistributed);
      socket.off(SocketEvents.PHASE_CHANGED, handlePhaseChanged);
      socket.off(SocketEvents.POLICE_SELECTED, handlePoliceSelected);
      socket.off(SocketEvents.GAME_OVER, handleGameOver);
      socket.off(SocketEvents.ROOM_UPDATED, handleRoomUpdated);
    };
  }, [
    socket, setMyRole, setPhase, setRound, setRajaId, setMantriId,
    setSelectionResult, setGameOver,
  ]);

  const startGame = () => {
    socket?.emit(SocketEvents.START_GAME);
  };

  const policeSelect = (chosenId: string) => {
    socket?.emit(SocketEvents.POLICE_SELECT, { chosenId });
  };

  const endGame = () => {
    socket?.emit(SocketEvents.END_GAME);
  };

  return {
    startGame,
    policeSelect,
    endGame,
  };
}
