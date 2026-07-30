import { useEffect } from "react";
import { useSocketStore } from "../store/socketStore";
import { useGameStore } from "../store/gameStore";
import { useRoomStore } from "../store/roomStore";
import { SocketEvents } from "../../shared/socket/events";
import type { GameRole, GamePhase } from "../../shared/socket/types";
import type { RoundHistoryItem } from "../store/gameStore";

export function useGame() {
  const socket = useSocketStore((s) => s.socket);
  const setMyRole = useGameStore((s) => s.setMyRole);
  const setPhase = useGameStore((s) => s.setPhase);
  const setRound = useGameStore((s) => s.setRound);
  const setShuffling = useGameStore((s) => s.setShuffling);
  const resetRound = useGameStore((s) => s.resetRound);
  const addRevealedPlayer = useGameStore((s) => s.addRevealedPlayer);
  const addHiddenPlayer = useGameStore((s) => s.addHiddenPlayer);
  const setHasRevealed = useGameStore((s) => s.setHasRevealed);
  const setHasHidden = useGameStore((s) => s.setHasHidden);
  const setMantriId = useGameStore((s) => s.setMantriId);
  const setRevealedRoles = useGameStore((s) => s.setRevealedRoles);
  const setLastRoundResult = useGameStore((s) => s.setLastRoundResult);
  const setCurrentScores = useGameStore((s) => s.setCurrentScores);
  const setCurrentTotals = useGameStore((s) => s.setCurrentTotals);
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);
  const setGameOver = useGameStore((s) => s.setGameOver);

  useEffect(() => {
    if (!socket) return;

    const handleGameStarting = () => {
      resetRound();
      setShuffling(true);
      setPhase("shuffling");
    };

    const handleCardsDistributed = (payload: { role?: string; phase?: string }) => {
      setShuffling(false);
      if (payload.role) setMyRole(payload.role as GameRole);
      if (payload.phase) setPhase(payload.phase as GamePhase);
    };

    const handlePhaseChanged = (payload: { phase?: string }) => {
      if (payload.phase) setPhase(payload.phase as GamePhase);
    };

    const handleCardRevealed = (payload: { playerId?: string }) => {
      if (payload.playerId) addRevealedPlayer(payload.playerId);
    };

    const handleCardHidden = (payload: { playerId?: string }) => {
      if (payload.playerId) addHiddenPlayer(payload.playerId);
    };

    const handleMantriRevealed = (payload: { mantriId?: string }) => {
      if (payload.mantriId) setMantriId(payload.mantriId);
    };

    const handleRolesRevealed = (payload: { roles?: Record<string, GameRole> }) => {
      if (payload.roles) setRevealedRoles(payload.roles);
    };

    const handleRoundResult = (payload: {
      roundNumber?: number;
      isCorrect?: boolean;
      scores?: Record<string, number>;
      roles?: Record<string, GameRole>;
      mantriId?: string;
      chosenId?: string;
    }) => {
      if (payload.roundNumber !== undefined && payload.scores && payload.roles) {
        setLastRoundResult({
          roundNumber: payload.roundNumber,
          isCorrect: payload.isCorrect ?? false,
          scores: payload.scores,
          roles: payload.roles,
          mantriId: payload.mantriId ?? "",
          chosenId: payload.chosenId ?? "",
        });
      }
    };

    const handleScoreUpdated = (payload: {
      scores?: Record<string, number>;
      totals?: Record<string, number>;
    }) => {
      if (payload.scores) setCurrentScores(payload.scores);
      if (payload.totals) setCurrentTotals(payload.totals);
    };

    const handleLeaderboardUpdated = (payload: {
      leaderboard?: { playerId: string; name: string; score: number }[];
    }) => {
      if (payload.leaderboard) setLeaderboard(payload.leaderboard);
    };

    const handleNextRoundStarted = (payload: { round?: number }) => {
      resetRound();
      setShuffling(true);
      if (payload.round !== undefined) setRound(payload.round);
      setPhase("shuffling");
    };

    const handleGameOver = (payload: {
      winnerId?: string;
      winnerName?: string;
      leaderboard?: { playerId: string; name: string; score: number }[];
      playerStatistics?: Record<string, unknown>;
      roundHistory?: RoundHistoryItem[];
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
    socket.on(SocketEvents.CARD_REVEALED, handleCardRevealed);
    socket.on(SocketEvents.CARD_HIDDEN, handleCardHidden);
    socket.on(SocketEvents.MANTRI_REVEALED, handleMantriRevealed);
    socket.on(SocketEvents.ROLES_REVEALED, handleRolesRevealed);
    socket.on(SocketEvents.ROUND_RESULT, handleRoundResult);
    socket.on(SocketEvents.SCORE_UPDATED, handleScoreUpdated);
    socket.on(SocketEvents.LEADERBOARD_UPDATED, handleLeaderboardUpdated);
    socket.on(SocketEvents.NEXT_ROUND_STARTED, handleNextRoundStarted);
    socket.on(SocketEvents.GAME_OVER, handleGameOver);
    socket.on(SocketEvents.ROOM_UPDATED, handleRoomUpdated);

    return () => {
      socket.off(SocketEvents.GAME_STARTING, handleGameStarting);
      socket.off(SocketEvents.CARDS_DISTRIBUTED, handleCardsDistributed);
      socket.off(SocketEvents.PHASE_CHANGED, handlePhaseChanged);
      socket.off(SocketEvents.CARD_REVEALED, handleCardRevealed);
      socket.off(SocketEvents.CARD_HIDDEN, handleCardHidden);
      socket.off(SocketEvents.MANTRI_REVEALED, handleMantriRevealed);
      socket.off(SocketEvents.ROLES_REVEALED, handleRolesRevealed);
      socket.off(SocketEvents.ROUND_RESULT, handleRoundResult);
      socket.off(SocketEvents.SCORE_UPDATED, handleScoreUpdated);
      socket.off(SocketEvents.LEADERBOARD_UPDATED, handleLeaderboardUpdated);
      socket.off(SocketEvents.NEXT_ROUND_STARTED, handleNextRoundStarted);
      socket.off(SocketEvents.GAME_OVER, handleGameOver);
      socket.off(SocketEvents.ROOM_UPDATED, handleRoomUpdated);
    };
  }, [
    socket, setMyRole, setPhase, setRound, setShuffling, resetRound,
    addRevealedPlayer, addHiddenPlayer, setHasRevealed, setHasHidden,
    setMantriId, setRevealedRoles, setLastRoundResult,
    setCurrentScores, setCurrentTotals, setLeaderboard, setGameOver,
  ]);

  const revealCard = () => {
    socket?.emit(SocketEvents.REVEAL_CARD);
    setHasRevealed(true);
  };

  const hideCard = () => {
    socket?.emit(SocketEvents.HIDE_CARD);
    setHasHidden(true);
  };

  const callMantri = (chosenId: string) => {
    socket?.emit(SocketEvents.CALL_MANTRI, { chosenId });
  };

  const submitGuess = (chosenId: string) => {
    socket?.emit(SocketEvents.SUBMIT_GUESS, { chosenId });
  };

  const startGame = () => {
    socket?.emit(SocketEvents.START_GAME);
  };

  const nextRound = () => {
    socket?.emit(SocketEvents.NEXT_ROUND);
  };

  const endGame = () => {
    socket?.emit(SocketEvents.END_GAME);
  };

  return {
    revealCard,
    hideCard,
    callMantri,
    submitGuess,
    startGame,
    nextRound,
    endGame,
  };
}
