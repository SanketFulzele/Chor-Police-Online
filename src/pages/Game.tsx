import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { RoyalPanel } from "../components/ui/RoyalPanel";
import { CrownIcon } from "../components/ui/CrownIcon";
import { PremiumBackground } from "../components/layout/PremiumBackground";
import { useRoomStore } from "../store/roomStore";
import { useGameStore } from "../store/gameStore";
import { useGame } from "../hooks/useGame";
import { GameCard } from "../components/game/Card";
import { PlayerList } from "../components/game/PlayerList";
import { ShuffleAnimation } from "../components/game/ShuffleAnimation";
import { IdentifyChorModal } from "../components/game/IdentifyChorModal";
import { RoundResultPopup } from "../components/game/RoundResultPopup";
import { VictoryScreen } from "../components/game/victory/VictoryScreen";
import { RankingList } from "../components/game/victory/RankingList";
import { ScoreTable } from "../components/game/victory/ScoreTable";
import { SectionHeader } from "../components/game/victory/SectionHeader";
import { IconHistory, IconTrophy } from "../components/game/victory/icons";
import { rankPlayers, toRows } from "../components/game/victory/types";
import { usePersistence } from "../hooks/usePersistence";
import { loadSession, clearSession } from "../utils/session";

export function GamePage() {
  const navigate = useNavigate();
  const room = useRoomStore((s) => s.room);
  const playerId = useRoomStore((s) => s.playerId);

  const phase = useGameStore((s) => s.phase);
  const round = useGameStore((s) => s.round);
  const myRole = useGameStore((s) => s.myRole);
  const hasRevealed = useGameStore((s) => s.hasRevealed);
  const hasHidden = useGameStore((s) => s.hasHidden);
  const showResult = useGameStore((s) => s.showResult);
  const currentTotals = useGameStore((s) => s.currentTotals);
  const winnerId = useGameStore((s) => s.winnerId);
  const winnerName = useGameStore((s) => s.winnerName);
  const playerStatistics = useGameStore((s) => s.playerStatistics);
  const roundHistory = useGameStore((s) => s.roundHistory);

  const {
    revealCard, hideCard, askForMantri, submitGuess,
    startGame, nextRound, endGame,
  } = useGame();

  const { saveGame } = usePersistence();

  const isHost = room?.hostId === playerId;
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!room) {
      const session = loadSession();
      if (session) {
        const timer = setTimeout(() => {
          if (!useRoomStore.getState().room) {
            clearSession();
            navigate("/");
          }
        }, 5000);
        return () => clearTimeout(timer);
      } else {
        navigate("/");
      }
    }
  }, [room, navigate]);

  useEffect(() => {
    if (phase === "finished" && winnerId && room) {
      saveGame({
        id: room.code + "-" + Date.now(),
        date: new Date().toISOString(),
        winnerId,
        winnerName: winnerName ?? "",
        roundsPlayed: roundHistory.length,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          score: p.totalScore,
        })),
        roundHistory: roundHistory.map((r) => ({
          round: r.roundNumber,
          roles: r.roles,
          mantriId: r.mantriId,
          chosenId: r.chosenId,
          correct: r.isCorrect,
          scores: r.scores,
        })),
      });
    }
  }, [phase, winnerId, winnerName, room, roundHistory, saveGame]);

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        useGameStore.getState().setShowResult(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResult]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-text-muted">Reconnecting...</p>
        </div>
      </div>
    );
  }

  const rajaRevealed = room.players.some((p) => p.publicRole === "raja");
  const mantriRevealed = room.players.some((p) => p.publicRole === "mantri");

  const hiddenPlayers = room.players.filter(
    (p) => p.publicRole !== "raja" && p.publicRole !== "mantri" && p.id !== playerId
  );

  const handleCancelGuess = () => {
    setModalOpen(false);
    setSelectedPlayer(null);
  };

  const handleConfirmChor = () => {
    if (selectedPlayer) {
      submitGuess(selectedPlayer);
      setModalOpen(false);
      setSelectedPlayer(null);
    }
  };

  const isGameplayPhase = phase && !["waiting", "shuffling", "card-distribution", "leaderboard", "finished", null].includes(phase);

  const leaderboardRows = toRows(room.roundHistory);
  const leaderboardRanked = rankPlayers(room.players, currentTotals, leaderboardRows);

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8">
      <PremiumBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`w-full space-y-6 text-center ${phase === "leaderboard" || phase === "finished" || isGameplayPhase ? "max-w-5xl" : "max-w-lg"}`}
      >
        {isGameplayPhase ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 max-w-28 bg-gradient-to-r from-transparent to-gold/40" />
              <CrownIcon className="w-8 h-8 text-gold drop-shadow-[0_0_14px_rgba(255,215,0,0.6)]" />
              <div className="h-px flex-1 max-w-28 bg-gradient-to-l from-transparent to-gold/40" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-[0.18em] gold-gradient text-glow">
              YOUR CARD
            </h2>
            <p className="text-sm uppercase tracking-[0.4em] text-gold/80 font-semibold">
              Round {round}
            </p>
            <p className="text-xs text-text-muted">
              Room Code:{" "}
              <span className="font-mono font-bold text-gold/90 tracking-widest">{room.code}</span>
            </p>
          </div>
        ) : phase === "finished" ? null : (
          <div className="space-y-1">
            <h2 className="text-2xl font-bold gold-gradient">
              {phase === "shuffling" && "Shuffling Cards..."}
              {phase === "card-distribution" && "Cards Distributed"}
              {phase === "leaderboard" && "Leaderboard"}
              {phase === "waiting" && "Ready to Play"}
            </h2>
            <p className="text-text-muted text-sm">
              Round {round} — Room: {room.code}
            </p>
          </div>
        )}

        {/* Gameplay: horizontal two-column layout (consistent across all gameplay phases) */}
        {isGameplayPhase && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-center gap-5 lg:gap-6 text-left">
            {/* Left: player list */}
            <RoyalPanel className="flex flex-col p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <h3 className="text-base font-bold tracking-wide text-text-primary">
                  Players{" "}
                  <span className="text-sm font-medium text-text-muted">
                    ({room.players.length}/4)
                  </span>
                </h3>
                <span className="text-xs font-semibold uppercase tracking-widest text-gold/70">
                  Round {round}
                </span>
              </div>
              <PlayerList players={room.players} playerId={playerId} />
            </RoyalPanel>

            {/* Right: role card panel */}
            <RoyalPanel decorativeCorners className="relative flex flex-col items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
              <GameCard
                size="sm"
                role={myRole ?? undefined}
                revealed={hasRevealed && !hasHidden}
                onReveal={revealCard}
                onHide={hideCard}
              />

              {myRole === "raja" && hasRevealed && !hasHidden && !rajaRevealed && (
                <p className="mt-4 text-sm text-yellow-400">
                  Raja revealed! Other players can now see who you are.
                </p>
              )}

              {myRole === "raja" && rajaRevealed && !mantriRevealed && (
                <Button
                  className="mt-4 gold-gradient text-black font-bold"
                  onClick={askForMantri}
                >
                  Ask: Who is my Mantri?
                </Button>
              )}

              {myRole === "mantri" && phase === "guessing" && (
                <Button
                  className="mt-4 w-full gold-gradient text-black font-bold"
                  onClick={() => setModalOpen(true)}
                >
                  Identify the Chor
                </Button>
              )}

              <div className="mt-6 flex w-full items-start gap-3 rounded-2xl border border-gold/20 bg-gold/[0.04] px-4 py-3 text-left">
                <CrownIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <p className="text-xs leading-relaxed text-text-secondary">
                  Keep your role a secret! Only the{" "}
                  <span className="font-semibold text-gold">Raja</span> is revealed
                  publicly. Click the card or use the buttons to peek and hide.
                </p>
              </div>
            </RoyalPanel>
          </div>
        )}

        {/* Phase: waiting */}
        {phase === "waiting" && (
          <RoyalPanel decorativeCorners className="px-6 py-8">
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/50" />
                <CrownIcon className="h-8 w-8 text-gold drop-shadow-[0_0_14px_rgba(255,215,0,0.5)]" />
                <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/50" />
              </div>
              <h3 className="text-center text-2xl font-black tracking-[0.2em] gold-gradient">READY TO PLAY</h3>
              <p className="text-center text-sm text-text-muted">{room.players.length}/4 players joined</p>
              <div className="space-y-2">
                {room.players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-1 ring-white/10"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold">{p.isHost ? `${p.name} (Host)` : p.name}</span>
                    </span>
                    <span className={`text-xs font-medium ${p.isReady ? "text-emerald" : "text-text-muted"}`}>
                      {p.isReady ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                ))}
              </div>
              {isHost && room.players.length === 4 && room.players.every((p) => p.isReady) && (
                <Button variant="gold-gradient" className="w-full" onClick={startGame}>
                  Start Game
                </Button>
              )}
            </div>
          </RoyalPanel>
        )}

        {/* Phase: shuffling */}
        {phase === "shuffling" && (
          <RoyalPanel decorativeCorners className="px-6 py-8">
            <ShuffleAnimation />
            <p className="mt-2 text-center text-sm text-text-muted">Shuffling and dealing cards...</p>
          </RoyalPanel>
        )}

        {/* Mantri popup modal */}
        <IdentifyChorModal
          open={modalOpen}
          hiddenPlayers={hiddenPlayers}
          selectedPlayerId={selectedPlayer}
          onSelect={(id) => setSelectedPlayer(id)}
          onConfirm={handleConfirmChor}
          onCancel={handleCancelGuess}
        />

        {/* Result popup */}
        <RoundResultPopup showResult={showResult} />



        {/* Phase: leaderboard */}
        {(phase === "leaderboard") && (
          <div className="flex flex-col" style={{ maxHeight: "calc(100vh - 12rem)" }}>
            <div className="flex-1 space-y-8 overflow-y-auto pr-1">
              <section className="text-left" aria-label="Current rankings">
                <SectionHeader
                  icon={<IconTrophy className="h-5 w-5" />}
                  title="Current Rankings"
                  subtitle="Live standings after this round"
                />
                <RankingList players={leaderboardRanked} playerId={playerId} />
              </section>

              <section className="text-left" aria-label="Score history">
                <SectionHeader
                  icon={<IconHistory className="h-5 w-5" />}
                  title="Score History"
                  subtitle="Points earned each round"
                />
                <ScoreTable rows={leaderboardRows} ranked={leaderboardRanked} playerId={playerId} />
              </section>
            </div>

            <div className="flex-shrink-0 pt-4">
              {isHost ? (
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={nextRound}>
                    Next Round
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={endGame}>
                    End Game
                  </Button>
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center">
                  Waiting for host...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Phase: finished */}
        {phase === "finished" && winnerId && (
          <VictoryScreen
            room={room}
            playerId={playerId}
            winnerId={winnerId}
            winnerName={winnerName ?? ""}
            playerStatistics={playerStatistics}
            roundHistory={roundHistory}
            currentTotals={currentTotals}
            onBackHome={() => navigate("/")}
            onGameHistory={() => navigate("/history")}
          />
        )}

        {phase === "waiting" && (
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        )}
      </motion.div>
    </div>
  );
}
