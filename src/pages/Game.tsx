import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
import type { GameRole } from "../types";

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

            {myRole === "mantri" && phase === "guessing" && (
              <Button
                variant="ghost"
                className="w-full mt-3 border border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                onClick={() => {
                  const modal = document.getElementById("mantri-modal");
                  if (modal) modal.classList.remove("hidden");
                }}
              >
                Identify the Chor
              </Button>
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



        {/* Phase: leaderboard */}
        {(phase === "leaderboard") && (
          <div className="flex flex-col" style={{ maxHeight: "calc(100vh - 12rem)" }}>
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div className="text-left">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
                  <span className="text-xl">🏆</span> Current Rankings
                </h3>
                <RankingCards
                  players={room.players}
                  roundHistory={room.roundHistory}
                  currentTotals={currentTotals ?? {}}
                  playerId={playerId}
                />
              </div>

              <div className="text-left">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
                  <span className="text-xl">📊</span> Score History
                </h3>
                <ScoreTable
                  players={room.players}
                  roundHistory={room.roundHistory}
                  currentTotals={currentTotals ?? {}}
                  playerId={playerId}
                />
              </div>
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
        {phase === "finished" && winnerId && (
          <div className="space-y-8" style={{ maxHeight: "calc(100vh - 10rem)" }}>
            <div className="overflow-y-auto space-y-8 pr-1">
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

              <div className="text-left">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-text">
                  <span className="text-xl">📊</span> Match History
                </h3>
                <ScoreTable
                  players={room.players}
                  roundHistory={roundHistory.length > 0 ? roundHistory : room.roundHistory}
                  currentTotals={currentTotals ?? {}}
                  playerId={playerId}
                />
              </div>

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

              <div className="flex flex-wrap gap-3 justify-center pb-4">
                <Button onClick={() => navigate("/")}>
                  Back to Home
                </Button>
                <Button variant="ghost" onClick={() => navigate("/history")}>
                  Game History
                </Button>
              </div>
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

interface RoundRow {
  n: number;
  scores: Record<string, number>;
  roles: Record<string, GameRole>;
}

interface ScoreTableProps {
  players: { id: string; name: string; avatarColor: string }[];
  roundHistory: { roundNumber?: number; round?: number; scores: Record<string, number>; roles: Record<string, GameRole> }[];
  currentTotals: Record<string, number>;
  playerId: string | null;
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

function ScoreTooltip({ cell }: { cell: { rect: DOMRect; role: GameRole; round: number } }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed z-[100] pointer-events-none"
      style={{
        left: cell.rect.left + cell.rect.width / 2,
        top: cell.rect.top - 8,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="bg-[#1c1c3a] text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/[0.1]">
        <div className="text-center text-white/40 text-[10px] mb-0.5 tracking-wide font-medium">Game {cell.round}</div>
        <div className="flex items-center gap-1.5">
          <span>{ROLE_EMOJIS[cell.role]} <span style={{ color: ROLE_COLORS[cell.role] }} className="font-semibold">{ROLE_LABELS[cell.role]}</span></span>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

function ScoreTable({ players, roundHistory, currentTotals, playerId }: ScoreTableProps) {
  const rows = toRows(roundHistory);
  const roundNumbers = [...new Set(rows.map((r) => r.n))].sort((a, b) => a - b);
  const [hoveredCell, setHoveredCell] = useState<{ rect: DOMRect; role: GameRole; round: number } | null>(null);
  const hoverRef = useRef<{ role: GameRole; round: number } | null>(null);

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
    <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-[#0a0a1e]/80 shadow-lg">
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "55vh" }}>
        <table className="w-full text-sm" style={{ tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-[72px] py-3.5 pl-4 pr-2 text-left text-[11px] font-bold uppercase tracking-widest text-white/35 bg-[#151535] border-b border-white/[0.06]">
                Game
              </th>
              {sorted.map((p, idx) => (
                <th
                  key={p.id}
                  className={`sticky top-0 z-10 py-3.5 px-3 text-right text-[11px] font-bold uppercase tracking-widest text-white/35 bg-[#151535] border-b border-white/[0.06] ${idx > 0 ? "border-l border-white/[0.03]" : ""}`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === playerId && <span className="text-white/20 text-[10px] ml-1 font-normal">(You)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roundNumbers.map((rn, i) => (
              <tr
                key={rn}
                className={`${i % 2 === 0 ? "bg-white/[0.015]" : "bg-white/[0.04]"} hover:bg-white/[0.08] transition-colors duration-150`}
              >
                <td className="sticky left-0 z-[2] w-[72px] py-2.5 pl-4 pr-2 text-xs font-medium text-white/35 whitespace-nowrap bg-inherit border-b border-white/[0.03]">
                  Game {rn}
                </td>
                {sorted.map((p, idx) => {
                  const score = getScore(p.id, rn);
                  const role = getRole(p.id, rn);
                  return (
                    <td
                      key={p.id}
                      className={`py-2.5 px-3 text-right font-mono text-sm border-b border-white/[0.03] cursor-default ${idx > 0 ? "border-l border-white/[0.03]" : ""}`}
                      onPointerEnter={(e) => {
                        if (!role) return;
                        hoverRef.current = { role, round: rn };
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setHoveredCell({ rect, role, round: rn });
                      }}
                      onPointerLeave={() => {
                        hoverRef.current = null;
                        setHoveredCell(null);
                      }}
                    >
                      <span className={`${score > 0 ? "text-emerald-400 font-semibold" : "text-white/15"} select-none`}>{score}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="sticky bottom-0 z-10 bg-[#151535] border-t border-white/[0.08]">
              <td className="py-3.5 pl-4 pr-2 text-[11px] font-bold uppercase tracking-widest text-gold/90">
                Total
              </td>
              {sorted.map((p, idx) => (
                <td
                  key={p.id}
                  className={`py-3.5 px-3 text-right font-bold font-mono text-sm text-gold ${idx > 0 ? "border-l border-white/[0.03]" : ""}`}
                >
                  {p.total}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <AnimatePresence>
        {hoveredCell && <ScoreTooltip key="tooltip" cell={hoveredCell} />}
      </AnimatePresence>
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