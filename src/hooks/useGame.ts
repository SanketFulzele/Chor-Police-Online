import { useEffect } from "react";
import { useSocketStore } from "../store/socketStore";
import { useGameStore } from "../store/gameStore";
import { SocketEvents } from "../../shared/socket/events";
import type { GameRole, GamePhase } from "../../shared/socket/types";

export function useGame() {
  const socket = useSocketStore((s) => s.socket);
  const setMyRole = useGameStore((s) => s.setMyRole);
  const setPhase = useGameStore((s) => s.setPhase);
  const setPhaseData = useGameStore((s) => s.setPhaseData);
  const setGameOver = useGameStore((s) => s.setGameOver);

  useEffect(() => {
    if (!socket) return;

    const handleCardsDistributed = (payload: { role?: string; phase?: string }) => {
      if (payload.role) setMyRole(payload.role as GameRole);
      if (payload.phase) setPhase(payload.phase as GamePhase);
    };

    const handlePhaseChanged = (payload: {
      phase?: string;
      rajaId?: string;
      mantriId?: string;
      chosenId?: string;
      chorId?: string;
      isCorrect?: boolean;
    }) => {
      if (payload.phase) {
        setPhaseData({
          phase: payload.phase as GamePhase,
          rajaId: payload.rajaId,
          mantriId: payload.mantriId,
          chosenId: payload.chosenId,
          chorId: payload.chorId,
          isCorrect: payload.isCorrect,
        });
      }
    };

    const handleGameOver = (payload: {
      winnerId?: string;
      winnerName?: string;
      winnerLabel?: string;
      leaderboard?: { playerId: string; name: string; score: number }[];
      playerStatistics?: Record<string, unknown>;
      roundHistory?: unknown[];
    }) => {
      if (payload.winnerId && payload.leaderboard) {
        setGameOver({
          winnerId: payload.winnerId,
          winnerName: payload.winnerName ?? "",
          winnerLabel: payload.winnerLabel ?? "",
          leaderboard: payload.leaderboard,
          playerStatistics: payload.playerStatistics as Record<string, never>,
          roundHistory: (payload.roundHistory ?? []) as never[],
        });
      }
    };

    socket.on(SocketEvents.CARDS_DISTRIBUTED, handleCardsDistributed);
    socket.on(SocketEvents.PHASE_CHANGED, handlePhaseChanged);
    socket.on(SocketEvents.GAME_OVER, handleGameOver);

    return () => {
      socket.off(SocketEvents.CARDS_DISTRIBUTED, handleCardsDistributed);
      socket.off(SocketEvents.PHASE_CHANGED, handlePhaseChanged);
      socket.off(SocketEvents.GAME_OVER, handleGameOver);
    };
  }, [socket, setMyRole, setPhase, setPhaseData, setGameOver]);

  const policeSelect = (chosenId: string) => {
    socket?.emit(SocketEvents.POLICE_SELECT, { chosenId });
  };

  const endGame = () => {
    socket?.emit(SocketEvents.END_GAME);
  };

  return { policeSelect, endGame };
}
