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
  const mantriId = useGameStore((s) => s.mantriId);
  const showResult = useGameStore((s) => s.showResult);
  const revealedRoles = useGameStore((s) => s.revealedRoles);
  const lastRoundResult = useGameStore((s) => s.lastRoundResult);
  const currentScores = useGameStore((s) => s.currentScores);
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

  const isGameplayPhase = phase && !["waiting", "shuffling", "card-distribution", "leaderboard", "finished", null].includes(phase);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`w-full space-y-6 text-center ${phase === "leaderboard" || phase === "finished" ? "max-w-5xl" : "max-w-lg"}`}
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
          <div className="space-y-1.5">
            {room.players.map((p) => {
              const isPublicRaja = p.publicRole === "raja";
              const isPublicMantri = p.publicRole === "mantri";
              return (
                <div
                  key={p.id}
                  className="glass rounded-lg px-3 py-2 flex items-center gap-2.5"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.name} {p.id === playerId && <span className="text-text-muted text-xs">(You)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-xs">
                    {isPublicRaja && (
                      <span className="font-bold text-gold">👑 Raja</span>
                    )}
                    {isPublicMantri && (
                      <span className="font-bold text-purple-400">📜 Mantri</span>
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

        {/* Persistent role card - always available during gameplay */}
        {myRole && phase && !["waiting", "shuffling", "card-distribution", "leaderboard", "finished", null].includes(phase) && (
          <Card>
            <GameCard
              role={myRole}
              revealed={hasRevealed && !hasHidden}
              onReveal={revealCard}
              onHide={hideCard}
            />

            {myRole === "raja" && hasRevealed && !hasHidden && !rajaRevealed && (
              <p className="text-sm text-yellow-400 mt-2">
                Raja revealed! Other players can now see who you are.
              </p>
            )}

            {myRole === "raja" && rajaRevealed && (
              <Button
                className="gold-gradient text-black font-bold mt-3"
                onClick={askForMantri}
              >
                Ask: Who is my Mantri?
              </Button>
            )}
          </Card>
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
              <div className="text-center space-y-2">
                <p className="text-5xl mb-2">{ROLE_EMOJIS.mantri}</p>
                <p className="text-text-secondary font-medium">
                  Mantri is identifying the Chor...
                </p>
                <p className="text-text-muted text-sm">
                  Please wait while the Mantri makes a decision.
                </p>
              </div>
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
          <div className="flex flex-col" style={{ maxHeight: "calc(100vh - 12rem)" }}>
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              <ScoreTable
                players={room.players}
                roundHistory={room.roundHistory}
                currentTotals={currentTotals ?? {}}
                playerId={playerId}
              />
            </div>

            <div className="flex-shrink-0 pt-4">
              {isHost && (
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={nextRound}>
                    Next Round
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={endGame}>
                    End Game
                  </Button>
                </div>
              )}

              {!isHost && (
                <p className="text-text-muted text-sm text-center">
                  Waiting for host...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Phase: finished */}
        {phase === "finished" && winnerId && (() => {
          const finishedRows = toRows(roundHistory.length > 0 ? roundHistory : room.roundHistory);
          const finishedRoundNumbers = [...new Set(finishedRows.map((r) => r.n))].sort((a, b) => a - b);
          const finishedTotals: Record<string, number> = {};
          room.players.forEach((p) => {
            finishedTotals[p.id] = currentTotals?.[p.id] ?? finishedRows.reduce((s, r) => s + (r.scores[p.id] ?? 0), 0);
          });
          const sortedFinished = [...room.players].map((p) => ({ ...p, total: finishedTotals[p.id] ?? 0 })).sort((a, b) => b.total - a.total);
          const fScore = (pid: string, n: number) => finishedRows.find((r) => r.n === n)?.scores[pid] ?? 0;
          const fRole = (pid: string, n: number) => finishedRows.find((r) => r.n === n)?.roles[pid];

          return (
          <div className="space-y-8" style={{ maxHeight: "calc(100vh - 10rem)" }}>
            <div className="overflow-y-auto space-y-8 pr-1">
              {/* Hero winner section */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-center space-y-5 py-4"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                  className="inline-block text-7xl"
                >
                  🏆
                </motion.span>
                <p className="text-4xl font-black tracking-wide gold-gradient">GAME OVER</p>
                <div className="flex justify-center">
                  <div className="relative">
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold border-[3px] border-gold shadow-[0_0_30px_rgba(234,179,8,0.25)]"
                      style={{
                        backgroundColor: room.players.find((p) => p.id === winnerId)?.avatarColor ?? "#7c3aed",
                      }}
                    >
                      {winnerName?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                      🏆 Champion
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gold">{winnerName}</p>
              </motion.div>

              {/* Final Standings — ranking cards */}
              <div className="text-left">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
                  <span className="text-xl">🏅</span> Final Standings
                </h3>
                <RankingCards
                  players={room.players}
                  roundHistory={roundHistory.length > 0 ? roundHistory : room.roundHistory}
                  currentTotals={currentTotals ?? {}}
                  playerId={playerId}
                />
              </div>

              {/* Match History — score table */}
              <div className="text-left">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
                  <span className="text-xl">📊</span> Match History
                </h3>
                <div className="overflow-x-auto">
                  <div className="overflow-y-auto rounded-lg border border-white/[0.06]" style={{ maxHeight: "45vh" }}>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#1e1e3a]">
                          <th className="sticky left-0 z-20 py-3 pr-4 text-left text-text-muted font-semibold min-w-[80px] bg-[#1e1e3a]">Game</th>
                          {sortedFinished.map((p) => (
                            <th key={p.id} className="py-3 px-4 text-right text-text-muted font-semibold whitespace-nowrap min-w-[100px] bg-[#1e1e3a]">
                              {p.name}
                              {p.id === playerId && <span className="text-text-muted text-xs ml-1 font-normal">(You)</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {finishedRoundNumbers.map((rn, i) => (
                          <tr key={rn} className={`${i % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.05]"} hover:bg-white/[0.08] transition-colors`}>
                            <td className="sticky left-0 z-10 py-3 pr-4 text-text-muted font-medium whitespace-nowrap bg-inherit">Game {rn}</td>
                            {sortedFinished.map((p) => {
                              const score = fScore(p.id, rn);
                              const role = fRole(p.id, rn);
                              return (
                                <td key={p.id} className="py-3 px-4 text-right font-mono relative group">
                                  <span className={score > 0 ? "text-emerald-400 font-medium" : "text-gray-500"}>{score}</span>
                                  {role && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                                      <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg border border-white/10">
                                        <div className="text-center text-text-muted text-[10px] mb-0.5">Game {rn}</div>
                                        <div className="flex items-center gap-1.5">
                                          <span>{ROLE_EMOJIS[role]} {ROLE_LABELS[role]}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#1e1e3a] border-t border-white/10 sticky bottom-0 z-20">
                          <td className="sticky left-0 z-30 py-3.5 pr-4 font-bold text-gold whitespace-nowrap bg-[#1e1e3a]">TOTAL</td>
                          {sortedFinished.map((p) => (
                            <td key={p.id} className="py-3.5 px-4 text-right font-bold font-mono text-gold bg-[#1e1e3a]">{p.total}</td>
                          ))}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Player Statistics */}
              {playerStatistics && Object.keys(playerStatistics).length > 0 && (
                <div className="text-left">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
                    <span className="text-xl">📋</span> Player Statistics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {room.players.map((p) => {
                      const stats = playerStatistics[p.id] as Record<string, number | string> | undefined;
                      if (!stats) return null;
                      return (
                        <div key={p.id} className="rounded-xl px-4 py-3 border border-white/[0.06] bg-white/[0.03]">
                          <p className="font-medium text-sm mb-2">
                            {p.name} {p.id === playerId && <span className="text-text-muted text-xs">(You)</span>}
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted">
                            <span>👑 Raja: {String(stats.timesRaja ?? 0)}x</span>
                            <span>📜 Mantri: {String(stats.timesMantri ?? 0)}x</span>
                            <span>🥷 Chor: {String(stats.timesChor ?? 0)}x</span>
                            <span>🔫 Daku: {String(stats.timesDaku ?? 0)}x</span>
                            <span>✓ Correct: {String(stats.correctGuesses ?? 0)}</span>
                            <span>✗ Wrong: {String(stats.wrongGuesses ?? 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center pb-4">
                <Button onClick={() => navigate("/")}>
                  Back to Home
                </Button>
                <Button variant="ghost" onClick={() => navigate("/history")}>
                  Game History
                </Button>
              </div>
            </div>
<<<<<<< HEAD

            {/* Fixed tooltip for finished phase */}
            {tooltip && (
              <div
                className="fixed z-[100] pointer-events-none"
                style={{
                  left: tooltip.rect.left + tooltip.rect.width / 2,
                  top: tooltip.rect.top - 10,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="bg-gray-900/95 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-white/[0.12] backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-center text-text-muted text-[10px] mb-0.5 tracking-wide">Game {tooltip.round}</div>
                  <div className="flex items-center gap-1.5">
                    <span>{ROLE_EMOJIS[tooltip.role]} {ROLE_LABELS[tooltip.role]}</span>
                  </div>
                </div>
              </div>
            )}
=======
>>>>>>> parent of 0ccea47 (leader board change design)
          </div>
          );
        })()}

        {phase === "waiting" && (
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        )}
      </motion.div>
    </div>
  );
}

interface RoundRow {
  n: number;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
}

interface ScoreTableProps {
  players: { id: string; name: string; avatarColor: string }[];
  roundHistory: { roundNumber?: number; round?: number; scores: Record<string, number>; roles: Record<string, GameRole> }[];
  currentTotals: Record<string, number>;
  playerId: string;
}

function toRows(rh: ScoreTableProps["roundHistory"]): RoundRow[] {
  return rh.map((r) => ({ n: r.roundNumber ?? r.round ?? 0, scores: r.scores, roles: r.roles }));
}

function placeLabel(i: number): string {
  if (i === 0) return "1st Place";
  if (i === 1) return "2nd Place";
  if (i === 2) return "3rd Place";
  return `${i + 1}th Place`;
}

function ScoreTable({ players, roundHistory, currentTotals, playerId }: ScoreTableProps) {
  const rows = toRows(roundHistory);
  const roundNumbers = [...new Set(rows.map((r) => r.n))].sort((a, b) => a - b);

  const sorted = [...players]
    .map((p) => ({
      ...p,
      total: currentTotals[p.id] ?? rows.reduce((sum, r) => sum + (r.scores[p.id] ?? 0), 0),
    }))
    .sort((a, b) => b.total - a.total);

  const getScore = (playerId: string, n: number) => {
    const rh = rows.find((r) => r.n === n);
    return rh?.scores[playerId] ?? 0;
  };

  const getRole = (playerId: string, n: number): GameRole | undefined => {
    const rh = rows.find((r) => r.n === n);
    return rh?.roles[playerId];
  };

  if (roundNumbers.length === 0) {
    return <p className="text-text-muted text-sm">No rounds completed yet.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Rankings */}
      <div className="text-left">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
          <span className="text-xl">🏆</span> Current Rankings
        </h3>
        <RankingCards
          players={players}
          roundHistory={roundHistory}
          currentTotals={currentTotals}
          playerId={playerId}
        />
      </div>

      {/* Score History Table */}
      <div className="text-left">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
          <span className="text-xl">📊</span> Score History
        </h3>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="overflow-y-auto rounded-lg border border-white/[0.06]" style={{ maxHeight: "55vh" }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1e1e3a]">
                  <th className="sticky left-0 z-20 py-3 pr-4 text-left text-text-muted font-semibold min-w-[80px] bg-[#1e1e3a]">
                    Game
                  </th>
                  {sorted.map((p) => (
                    <th key={p.id} className="py-3 px-4 text-right text-text-muted font-semibold whitespace-nowrap min-w-[100px] bg-[#1e1e3a]">
                      {p.name}
                      {p.id === playerId && <span className="text-text-muted text-xs ml-1 font-normal">(You)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roundNumbers.map((rn, i) => (
                  <tr
                    key={rn}
                    className={`${i % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.05]"} hover:bg-white/[0.08] transition-colors`}
                  >
                    <td className="sticky left-0 z-10 py-3 pr-4 text-text-muted font-medium whitespace-nowrap bg-inherit">
                      Game {rn}
                    </td>
                    {sorted.map((p) => {
                      const score = getScore(p.id, rn);
                      const role = getRole(p.id, rn);
                      return (
                        <td key={p.id} className="py-3 px-4 text-right font-mono relative group">
                          <span className={score > 0 ? "text-emerald-400 font-medium" : "text-gray-500"}>{score}</span>
                          {role && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg border border-white/10">
                                <div className="text-center text-text-muted text-[10px] mb-0.5">Game {rn}</div>
                                <div className="flex items-center gap-1.5">
                                  <span>{ROLE_EMOJIS[role]} {ROLE_LABELS[role]}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#1e1e3a] border-t border-white/10 sticky bottom-0 z-20">
                  <td className="sticky left-0 z-30 py-3.5 pr-4 font-bold text-gold whitespace-nowrap bg-[#1e1e3a]">
                    TOTAL
                  </td>
                  {sorted.map((p) => (
                    <td key={p.id} className="py-3.5 px-4 text-right font-bold font-mono text-gold bg-[#1e1e3a]">
                      {p.total}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankingCards({ players, roundHistory, currentTotals, playerId }: ScoreTableProps) {
  const rows = toRows(roundHistory);
  const medals = ["🥇", "🥈", "🥉"];

  const sorted = [...players]
    .map((p) => ({
      ...p,
      total: currentTotals[p.id] ?? rows.reduce((sum, r) => sum + (r.scores[p.id] ?? 0), 0),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sorted.map((p, i) => {
        const isFirst = i === 0;
        return (
          <div
            key={p.id}
            className={`rounded-xl px-5 py-4 flex items-center gap-4 border transition-shadow ${
              isFirst
                ? "border-yellow-500/30 bg-gradient-to-br from-yellow-900/15 via-transparent to-transparent shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                : "border-white/[0.06] bg-white/[0.03]"
            }`}
          >
            <span className="text-3xl shrink-0">{medals[i] ?? `${i + 1}.`}</span>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{ backgroundColor: p.avatarColor }}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${isFirst ? "text-base" : "text-sm"}`}>
                {p.name}
                {p.id === playerId && <span className="text-text-muted text-xs ml-1 font-normal">(You)</span>}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{placeLabel(i)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-bold font-mono text-gold ${isFirst ? "text-2xl" : "text-xl"}`}>{p.total}</p>
              <p className="text-xs text-text-muted -mt-0.5">Points</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}