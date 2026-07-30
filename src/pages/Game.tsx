import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useRoomStore } from "../store/roomStore";
import { useGameStore } from "../store/gameStore";
import { useGame } from "../hooks/useGame";
import { GameCard } from "../components/game/Card";
import { ShuffleAnimation } from "../components/game/ShuffleAnimation";
import { ROLE_EMOJIS, ROLE_LABELS, ROLE_COLORS } from "../constants/game";
import { usePersistence } from "../hooks/usePersistence";

export function GamePage() {
  const navigate = useNavigate();
  const room = useRoomStore((s) => s.room);
  const playerId = useRoomStore((s) => s.playerId);

  const phase = useGameStore((s) => s.phase);
  const round = useGameStore((s) => s.round);
  const myRole = useGameStore((s) => s.myRole);
  const hasRevealed = useGameStore((s) => s.hasRevealed);
  const hasHidden = useGameStore((s) => s.hasHidden);
  const mantriId = useGameStore((s) => s.mantriId);
  const showResult = useGameStore((s) => s.showResult);
  const revealedRoles = useGameStore((s) => s.revealedRoles);
  const lastRoundResult = useGameStore((s) => s.lastRoundResult);
  const currentScores = useGameStore((s) => s.currentScores);
  const currentTotals = useGameStore((s) => s.currentTotals);
  const leaderboard = useGameStore((s) => s.leaderboard);
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

  useEffect(() => {
    if (!room) {
      navigate("/");
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

  if (!room) return null;

  const mantri = mantriId ? room.players.find((p) => p.id === mantriId) : null;
  const rajaRevealed = room.players.some((p) => p.publicRole === "raja");

  const hiddenPlayers = room.players.filter(
    (p) => p.publicRole !== "raja" && p.publicRole !== "mantri" && p.id !== playerId
  );

  const handleConfirmGuess = () => {
    if (selectedPlayer) {
      submitGuess(selectedPlayer);
      setSelectedPlayer(null);
    }
  };

  const isGameplayPhase = phase && !["waiting", "shuffling", "card-distribution", null].includes(phase);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg space-y-6 text-center"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-bold gold-gradient">
            {phase === "shuffling" && "Shuffling Cards..."}
            {phase === "card-distribution" && "Cards Distributed"}
            {phase === "card-reveal" && "Your Card"}
            {phase === "mantri-reveal" && "Mantri Revealed"}
            {phase === "guessing" && "Mantri is Choosing"}
            {phase === "reveal-roles" && "Revealing All Roles"}
            {phase === "score-update" && "Round Result"}
            {phase === "leaderboard" && "Leaderboard"}
            {phase === "finished" && "Game Over"}
            {phase === "waiting" && "Ready to Play"}
          </h2>
          <p className="text-text-muted text-sm">
            Round {round} — Room: {room.code}
          </p>
        </div>

        {/* Persistent player list during gameplay */}
        {isGameplayPhase && (
          <div className="space-y-2">
            {room.players.map((p) => {
              const isPublicRaja = p.publicRole === "raja";
              const isPublicMantri = p.publicRole === "mantri";
              return (
                <div
                  key={p.id}
                  className="glass rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">
                      {p.name} {p.id === playerId && <span className="text-text-muted text-xs">(You)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isPublicRaja && (
                      <span className="text-sm font-bold text-gold flex items-center gap-1">
                        👑 Raja
                      </span>
                    )}
                    {isPublicMantri && (
                      <span className="text-sm font-bold text-purple-400 flex items-center gap-1">
                        📜 Mantri
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Phase: waiting */}
        {phase === "waiting" && (
          <Card>
            <p className="text-text-secondary mb-4">
              {room.players.length}/4 players joined
            </p>
            {room.players.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-2 py-1">
                <span className="text-sm">{p.isHost ? `${p.name} (Host)` : p.name}</span>
                <span className={`text-xs ${p.isReady ? "text-green-400" : "text-gray-500"}`}>
                  {p.isReady ? "Ready" : "Not Ready"}
                </span>
              </div>
            ))}
            {isHost && room.players.length === 4 && room.players.every((p) => p.isReady) && (
              <Button className="mt-4" onClick={startGame}>
                Start Game
              </Button>
            )}
          </Card>
        )}

        {/* Phase: shuffling */}
        {phase === "shuffling" && (
          <Card>
            <ShuffleAnimation />
            <p className="text-text-muted text-sm mt-4">Shuffling and dealing cards...</p>
          </Card>
        )}

        {/* Phase: card-distribution / card-reveal */}
        {(phase === "card-distribution" || phase === "card-reveal") && (
          <div className="space-y-6">
            {phase === "card-reveal" && (
              <>
                <GameCard
                  role={myRole ?? undefined}
                  revealed={hasRevealed && !hasHidden}
                  onReveal={revealCard}
                  onHide={hideCard}
                />

                {myRole === "raja" && hasRevealed && !hasHidden && !rajaRevealed && (
                  <p className="text-sm text-yellow-400">
                    Raja revealed! Other players can now see who you are.
                  </p>
                )}

                {myRole === "raja" && rajaRevealed && (
                  <Button
                    className="gold-gradient text-black font-bold"
                    onClick={askForMantri}
                  >
                    Ask: Who is my Mantri?
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Phase: mantri-reveal */}
        {phase === "mantri-reveal" && mantri && (
          <Card>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-6xl mb-2">{ROLE_EMOJIS.mantri}</div>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
                style={{ backgroundColor: mantri.avatarColor }}
              >
                {mantri.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-xl font-bold" style={{ color: ROLE_COLORS.mantri }}>
                Mantri
              </p>
              <p className="text-text-secondary">{mantri.name}</p>
            </motion.div>
          </Card>
        )}

        {/* Phase: guessing */}
        {phase === "guessing" && (
          <Card>
            {myRole === "mantri" ? (
              <>
                <p className="text-4xl mb-2">{ROLE_EMOJIS.mantri}</p>
                <p className="text-lg font-semibold mb-1" style={{ color: ROLE_COLORS.mantri }}>
                  You are the Mantri
                </p>
                <p className="text-text-secondary text-sm mb-4">
                  Identify the Chor
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    const modal = document.getElementById("mantri-modal");
                    if (modal) modal.classList.remove("hidden");
                  }}
                >
                  Identify the Chor
                </Button>
              </>
            ) : (
              <>
                <p className="text-4xl mb-2">🤔</p>
                <p className="text-text-secondary">
                  The Mantri is trying to identify the Chor...
                </p>
              </>
            )}
          </Card>
        )}

        {/* Mantri popup modal */}
        <div
          id="mantri-modal"
          className="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="glass rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4">
            <p className="text-lg font-semibold text-center">Identify the Chor</p>
            <p className="text-sm text-text-muted text-center">
              Select one of the remaining players
            </p>
            <div className="space-y-2">
              {hiddenPlayers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayer(p.id)}
                  className={`w-full glass rounded-xl px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${
                    selectedPlayer === p.id ? "ring-2 ring-gold bg-white/10" : "hover:bg-white/10"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{p.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("mantri-modal")?.classList.add("hidden");
                  setSelectedPlayer(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedPlayer}
                onClick={() => {
                  handleConfirmGuess();
                  document.getElementById("mantri-modal")?.classList.add("hidden");
                }}
                className="flex-1 px-4 py-2.5 bg-gold text-black hover:bg-gold/90 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>

        {/* Result toast */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-lg font-bold ${
              showResult.isCorrect
                ? "bg-emerald/90 text-white"
                : "bg-rose/90 text-white"
            }`}
          >
            {showResult.isCorrect ? "✅ Correct Answer" : "❌ Wrong Answer"}
          </motion.div>
        )}

        {/* Phase: reveal-roles */}
        {phase === "reveal-roles" && revealedRoles && (
          <div className="space-y-4">
            {room.players.map((p) => {
              const role = revealedRoles[p.id];
              if (!role) return null;
              const isMe = p.id === playerId;
              return (
                <motion.div
                  key={p.id}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="glass rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">
                      {p.name} {isMe && <span className="text-text-muted text-xs">(You)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ROLE_EMOJIS[role]}</span>
                    <span className="text-sm font-semibold" style={{ color: ROLE_COLORS[role] }}>
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Phase: score-update */}
        {phase === "score-update" && lastRoundResult && currentScores && (
          <Card>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <p className={`text-2xl font-bold ${lastRoundResult.isCorrect ? "text-emerald" : "text-rose"}`}>
                {lastRoundResult.isCorrect ? "Correct Guess! ✓" : "Wrong Guess! ✗"}
              </p>
              <div className="space-y-2">
                {room.players.map((p) => {
                  const score = currentScores[p.id] ?? 0;
                  const total = currentTotals?.[p.id] ?? p.totalScore;

                  return (
                    <div
                      key={p.id}
                      className="glass rounded-xl px-4 py-3 flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-text-muted">
                          Total: {total}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${score >= 0 ? "text-emerald" : "text-rose"}`}>
                          {score >= 0 ? "+" : ""}{score}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </Card>
        )}

        {/* Phase: leaderboard */}
        {(phase === "leaderboard") && (
          <Card>
            <div className="space-y-3">
              {(leaderboard.length > 0 ? leaderboard : room.players
                .map((p) => ({ playerId: p.id, name: p.name, score: p.totalScore }))
                .sort((a, b) => b.score - a.score)
              ).map((entry, i) => (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 glass rounded-xl px-4 py-3"
                >
                  <span className="text-lg w-8 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">
                      {entry.name}
                      {entry.playerId === playerId && <span className="text-text-muted text-xs ml-1">(You)</span>}
                    </p>
                  </div>
                  <span className="text-lg font-bold font-mono">{entry.score}</span>
                </motion.div>
              ))}

              {isHost && (
                <div className="flex gap-3 mt-6">
                  <Button className="flex-1" onClick={nextRound}>
                    Next Round
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={endGame}>
                    End Game
                  </Button>
                </div>
              )}

              {!isHost && (
                <p className="text-text-muted text-sm mt-4">
                  Waiting for host...
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Phase: finished */}
        {phase === "finished" && winnerId && (
          <div className="space-y-6">
            <Card>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <p className="text-6xl">🏆</p>
                <p className="text-3xl font-bold gold-gradient">Game Over</p>
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mx-auto border-4 border-gold"
                  style={{
                    backgroundColor: room.players.find((p) => p.id === winnerId)?.avatarColor ?? "#7c3aed",
                  }}
                >
                  {winnerName?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <p className="text-xl font-semibold text-gold">{winnerName}</p>
                <p className="text-text-muted text-sm">is the Champion!</p>
              </motion.div>
            </Card>

            {/* Podium */}
            <Card>
              <p className="text-lg font-semibold mb-4">Final Standings</p>
              <div className="space-y-3">
                {leaderboard.map((entry, i) => (
                  <motion.div
                    key={entry.playerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3 glass rounded-xl px-4 py-3"
                  >
                    <span className="text-2xl w-10 text-center">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    </span>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ backgroundColor: room.players.find((p) => p.id === entry.playerId)?.avatarColor ?? "#7c3aed" }}
                    >
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">
                        {entry.name}
                        {entry.playerId === playerId && <span className="text-text-muted text-xs ml-1">(You)</span>}
                      </p>
                    </div>
                    <span className="text-lg font-bold font-mono">{entry.score}</span>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Statistics */}
            {playerStatistics && Object.keys(playerStatistics).length > 0 && (
              <Card>
                <p className="text-lg font-semibold mb-4">Player Statistics</p>
                <div className="space-y-3">
                  {room.players.map((p) => {
                    const stats = playerStatistics[p.id] as Record<string, number | string> | undefined;
                    if (!stats) return null;
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-xl px-4 py-3 text-left"
                      >
                        <p className="font-medium text-sm mb-2">
                          {p.name} {p.id === playerId && <span className="text-text-muted text-xs">(You)</span>}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                          <span>👑 Raja: {String(stats.timesRaja ?? 0)}x</span>
                          <span>👮 Mantri: {String(stats.timesMantri ?? 0)}x</span>
                          <span>🥷 Chor: {String(stats.timesChor ?? 0)}x</span>
                          <span>🔫 Daku: {String(stats.timesDaku ?? 0)}x</span>
                          <span>✓ Correct: {String(stats.correctGuesses ?? 0)}</span>
                          <span>✗ Wrong: {String(stats.wrongGuesses ?? 0)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/")}>
                Back to Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/history")}>
                Game History
              </Button>
            </div>
          </div>
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