import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useRoomStore } from "../store/roomStore";
import { useGameStore } from "../store/gameStore";
import { useGame } from "../hooks/useGame";
import { ROLE_EMOJIS, ROLE_LABELS, ROLE_COLORS } from "../constants/game";

export function GamePage() {
  const navigate = useNavigate();
  const room = useRoomStore((s) => s.room);
  const playerId = useRoomStore((s) => s.playerId);

  const phase = useGameStore((s) => s.phase);
  const myRole = useGameStore((s) => s.myRole);
  const rajaId = useGameStore((s) => s.rajaId);
  const mantriId = useGameStore((s) => s.mantriId);
  const chosenId = useGameStore((s) => s.chosenId);
  const chorId = useGameStore((s) => s.chorId);
  const isCorrect = useGameStore((s) => s.isCorrect);
  const winnerId = useGameStore((s) => s.winnerId);
  const winnerName = useGameStore((s) => s.winnerName);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const playerStatistics = useGameStore((s) => s.playerStatistics);
  const { policeSelect } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!room) {
      navigate("/");
    }
  }, [room, navigate]);

  const raja = rajaId ? room?.players.find((p) => p.id === rajaId) : null;
  const mantri = mantriId ? room?.players.find((p) => p.id === mantriId) : null;
  const chosen = chosenId ? room?.players.find((p) => p.id === chosenId) : null;
  const chor = chorId ? room?.players.find((p) => p.id === chorId) : null;

  // Candidates for police selection (non-raja, non-mantri, non-police, connected)
  const policeCandidates = room?.players.filter(
    (p) =>
      p.id !== playerId &&
      p.id !== rajaId &&
      p.id !== mantriId &&
      p.isConnected &&
      room.players.find((rp) => rp.id === p.id)?.currentRole !== "police"
  ) ?? [];

  const phaseTitle: Record<string, string> = {
    "role-assignment": "Your Role",
    "reveal-raja": "Raja Revealed",
    "reveal-mantri": "Mantri Revealed",
    "police-selection": "Police Selection",
    "reveal-result": "Result",
    finished: "Game Over",
  };

  if (!room) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg space-y-6 text-center"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-bold gold-gradient">
            {phaseTitle[phase ?? "waiting"] ?? "Game"}
          </h2>
          <p className="text-text-muted text-sm">
            Round {room.round} — Room: {room.code}
          </p>
        </div>

        {/* Phase: role-assignment */}
        {phase === "role-assignment" && myRole && (
          <Card>
            <motion.div
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-6xl">{ROLE_EMOJIS[myRole]}</div>
              <p className="text-2xl font-bold" style={{ color: ROLE_COLORS[myRole] }}>
                {ROLE_LABELS[myRole]}
              </p>
              <p className="text-text-muted text-sm">Your role this round</p>
            </motion.div>
          </Card>
        )}

        {/* Phase: reveal-raja */}
        {phase === "reveal-raja" && raja && (
          <Card>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-6xl">👑</div>
              <p className="text-xl text-gold font-bold">Raja has been revealed</p>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto border-4 border-gold"
                style={{ backgroundColor: raja.avatarColor }}
              >
                {raja.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-xl font-bold">{raja.name}</p>
              <span className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold text-sm font-semibold">
                👑 Raja
              </span>
              <p className="text-text-muted text-sm">
                {raja.id === playerId ? "You are the Raja!" : `The Raja is ${raja.name}`}
              </p>
            </motion.div>
          </Card>
        )}

        {/* Phase: reveal-mantri */}
        {phase === "reveal-mantri" && (
          <Card>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-lg text-text-secondary">Raja asks: Who is my Mantri?</p>
              {mantri ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-6xl">📜</div>
                  <p className="text-xl font-bold" style={{ color: ROLE_COLORS.mantri }}>
                    Mantri has been revealed
                  </p>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
                    style={{ backgroundColor: mantri.avatarColor }}
                  >
                    {mantri.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xl font-bold">{mantri.name}</p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "#7c3aed33", color: ROLE_COLORS.mantri }}
                  >
                    📜 Mantri
                  </span>
                </motion.div>
              ) : (
                <p className="text-text-muted">Waiting for Mantri to reveal...</p>
              )}
            </motion.div>
          </Card>
        )}

        {/* Phase: police-selection */}
        {phase === "police-selection" && (
          <Card>
            <div className="space-y-4">
              <p className="text-lg text-text-secondary">Raja orders the Police to identify the Chor.</p>

              {myRole === "police" && !confirmed && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold" style={{ color: ROLE_COLORS.police }}>
                    Choose who you think is the Chor:
                  </p>
                  {policeCandidates.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all cursor-pointer ${
                        selectedId === p.id
                          ? "ring-2 ring-gold bg-gold/10"
                          : "hover:bg-white/10"
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
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedId(null)}
                      disabled={!selectedId}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      className="flex-1"
                      disabled={!selectedId}
                      onClick={() => {
                        if (selectedId) {
                          setConfirmed(true);
                          policeSelect(selectedId);
                        }
                      }}
                    >
                      Confirm Selection
                    </Button>
                  </div>
                </div>
              )}

              {myRole === "police" && confirmed && (
                <div className="space-y-3">
                  <div className="text-4xl">👮</div>
                  <p className="text-text-secondary">Your selection has been submitted!</p>
                </div>
              )}

              {myRole !== "police" && (
                <div className="space-y-3">
                  <div className="text-4xl">👮</div>
                  <p className="text-text-muted">Police is making a decision...</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Phase: reveal-result */}
        {phase === "reveal-result" && isCorrect !== null && (
          <Card>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Police's choice */}
              <div className="space-y-2">
                <p className="text-sm text-text-muted">Police accused:</p>
                {chosen && (
                  <div
                    className="glass rounded-xl px-4 py-3 flex items-center gap-3 mx-auto max-w-xs"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ backgroundColor: chosen.avatarColor }}
                    >
                      {chosen.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{chosen.name}</span>
                  </div>
                )}
              </div>

              {/* Actual Chor */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-2"
              >
                <p className="text-sm text-text-muted">Actual Chor:</p>
                {chor && (
                  <div
                    className="glass rounded-xl px-4 py-3 flex items-center gap-3 mx-auto max-w-xs border border-rose/30"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ backgroundColor: chor.avatarColor }}
                    >
                      {chor.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{chor.name}</span>
                    <span className="text-2xl">🥷</span>
                  </div>
                )}
              </motion.div>

              {/* Result */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="pt-4"
              >
                {isCorrect ? (
                  <div className="space-y-2">
                    <p className="text-2xl text-emerald font-bold">✅ Police caught the Chor!</p>
                    <p className="text-lg text-gold font-semibold">🏆 Winners: Raja, Mantri & Police</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl text-rose font-bold">❌ Police accused the wrong player</p>
                    <p className="text-lg text-gold font-semibold">🏆 Winner: Chor</p>
                  </div>
                )}
              </motion.div>

              {/* Scores */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="space-y-2 pt-2"
              >
                <p className="text-sm font-semibold text-text-primary">Scores</p>
                {room.players.map((p) => {
                  const role = room.roundHistory[room.roundHistory.length - 1]?.roles[p.id];
                  const score = room.roundHistory[room.roundHistory.length - 1]?.scores[p.id] ?? 0;
                  return (
                    <div key={p.id} className="flex items-center justify-between glass rounded-xl px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ backgroundColor: p.avatarColor }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{p.name}</span>
                        {role && (
                          <span className="text-xs">{ROLE_EMOJIS[role]} {ROLE_LABELS[role]}</span>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${score >= 0 ? "text-emerald" : "text-rose"}`}>
                        {score >= 0 ? "+" : ""}{score}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
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
                <p className="text-text-muted text-sm">
                  {isCorrect ? "Police & Raja win!" : "Chor escapes!"}
                </p>
              </motion.div>
            </Card>

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
                          <span>📜 Mantri: {String(stats.timesMantri ?? 0)}x</span>
                          <span>🥷 Chor: {String(stats.timesChor ?? 0)}x</span>
                          <span>👮 Police: {String(stats.timesPolice ?? 0)}x</span>
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

        {/* Phase not recognized (waiting, etc) */}
        {(!phase || phase === "waiting") && (
          <Card>
            <p className="text-text-muted">Waiting for game to start...</p>
          </Card>
        )}

        {(phase === "finished" || phase === "reveal-result") && (
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        )}
      </motion.div>
    </div>
  );
}
