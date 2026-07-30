import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRoomStore } from "../store/roomStore";
import { useGameStore } from "../store/gameStore";
import { useGame } from "../hooks/useGame";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ROLE_EMOJIS, ROLE_LABELS, ROLE_COLORS } from "../constants/game";

export function GamePage() {
  const navigate = useNavigate();
  const room = useRoomStore((s) => s.room);
  const playerId = useRoomStore((s) => s.playerId);

  const {
    myRole, phase, rajaId, mantriId, chosenId, chorId, isCorrect,
    winnerId, winnerName, winnerLabel, leaderboard, playerStatistics,
  } = useGameStore();

  const { policeSelect, endGame } = useGame();

  const isHost = room?.hostId === playerId;

  useEffect(() => {
    if (!room) navigate("/");
  }, [room, navigate]);

  if (!room) return null;

  const raja = rajaId ? room.players.find((p) => p.id === rajaId) ?? null : null;
  const mantri = mantriId ? room.players.find((p) => p.id === mantriId) ?? null : null;
  const accused = chosenId ? room.players.find((p) => p.id === chosenId) ?? null : null;
  const chor = chorId ? room.players.find((p) => p.id === chorId) ?? null : null;

  const policeCandidates = room.players.filter(
    (p) =>
      p.id !== playerId &&
      p.id !== rajaId &&
      p.id !== mantriId &&
      p.isConnected
  );

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCandidate(null);
  }, [phase]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg space-y-6 text-center"
      >
        {/* Phase: role-assignment */}
        {phase === "role-assignment" && myRole && (
          <div className="space-y-6">
            <p className="text-text-muted text-sm">Your Role</p>
            <motion.div
              initial={{ rotateY: 180, opacity: 0, scale: 0.5 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="perspective-1000"
            >
              <div className="glass rounded-2xl p-8 max-w-xs mx-auto">
                <div className="text-7xl mb-4">{ROLE_EMOJIS[myRole]}</div>
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: ROLE_COLORS[myRole] }}
                >
                  {ROLE_LABELS[myRole]}
                </h2>
                <p className="text-text-muted text-sm">
                  {myRole === "raja" && "You are the ruler. Lead wisely."}
                  {myRole === "mantri" && "You are the advisor. Support the Raja."}
                  {myRole === "police" && "You must identify the Chor!"}
                  {myRole === "chor" && "Stay hidden. Don't get caught!"}
                </p>
              </div>
            </motion.div>
            <p className="text-text-muted text-sm animate-pulse">
              Preparing the game...
            </p>
          </div>
        )}

        {/* Phase: reveal-raja */}
        {phase === "reveal-raja" && raja && (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <Card>
                <p className="text-6xl mb-4">👑</p>
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mx-auto border-4 border-gold"
                  style={{ backgroundColor: raja.avatarColor }}
                >
                  {raja.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold gold-gradient mt-4">
                  {raja.name}
                </h2>
                <p className="text-gold text-lg">Raja</p>
                {raja.id === playerId && (
                  <p className="text-text-muted text-sm">You are the Raja!</p>
                )}
              </Card>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-text-secondary text-lg"
              >
                👑 Raja has been revealed.
              </motion.p>
            </motion.div>
          </div>
        )}

        {/* Phase: reveal-mantri */}
        {phase === "reveal-mantri" && (
          <div className="space-y-6">
            {raja && (
              <Card>
                <p className="text-4xl mb-2">👑</p>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto"
                  style={{ backgroundColor: raja.avatarColor }}
                >
                  {raja.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-lg font-semibold text-gold mt-2">{raja.name}</p>
                <p className="text-text-muted text-sm">Raja</p>
              </Card>
            )}

            {!mantri && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <p className="text-4xl">🤔</p>
                <p className="text-text-secondary text-lg">
                  📜 Raja asks: Who is my Mantri?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      className="w-2 h-2 rounded-full bg-gold"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {mantri && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <Card>
                  <p className="text-6xl mb-2">{ROLE_EMOJIS.mantri}</p>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
                    style={{ backgroundColor: mantri.avatarColor }}
                  >
                    {mantri.name.charAt(0).toUpperCase()}
                  </div>
                  <h2
                    className="text-xl font-bold mt-3"
                    style={{ color: ROLE_COLORS.mantri }}
                  >
                    {mantri.name}
                  </h2>
                  <p className="text-sm" style={{ color: ROLE_COLORS.mantri }}>
                    Mantri
                  </p>
                  {mantri.id === playerId && (
                    <p className="text-text-muted text-sm">You are the Mantri!</p>
                  )}
                </Card>
                <p className="text-text-secondary text-lg">
                  📜 Mantri has been revealed.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Phase: police-selection */}
        {phase === "police-selection" && (
          <div className="space-y-6">
            {myRole === "police" ? (
              <div className="space-y-4">
                <p className="text-4xl">{ROLE_EMOJIS.police}</p>
                <h2 className="text-xl font-bold" style={{ color: ROLE_COLORS.police }}>
                  You are the Police
                </h2>
                <p className="text-text-secondary">
                  👮 Raja orders the Police to identify the Chor.
                </p>
                <p className="text-text-muted text-sm mb-4">
                  Choose who you think is the Chor
                </p>
                <div className="space-y-2">
                  {policeCandidates.length === 0 ? (
                    <p className="text-text-muted text-sm">No candidates available.</p>
                  ) : (
                    policeCandidates.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setSelectedCandidate(
                            selectedCandidate === p.id ? null : p.id
                          )
                        }
                        className={`w-full glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all cursor-pointer ${
                          selectedCandidate === p.id
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
                        <div className="flex-1 text-left">
                          <p className="font-medium">{p.name}</p>
                        </div>
                        {selectedCandidate === p.id && (
                          <span className="text-gold text-lg">✓</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setSelectedCandidate(null)}
                    disabled={!selectedCandidate}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gold"
                    className="flex-1"
                    onClick={() => {
                      if (selectedCandidate) policeSelect(selectedCandidate);
                    }}
                    disabled={!selectedCandidate}
                  >
                    Confirm Selection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-4xl">👮</p>
                <p className="text-text-secondary text-lg">
                  👮 Raja orders the Police to identify the Chor.
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      className="w-2 h-2 rounded-full bg-blue-400"
                    />
                  ))}
                </div>
                <p className="text-text-muted text-sm">
                  Police is making a decision...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Phase: reveal-result */}
        {phase === "reveal-result" && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Card>
                <p className="text-text-muted text-sm mb-2">Police accused</p>
                {accused ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
                      style={{ backgroundColor: accused.avatarColor }}
                    >
                      {accused.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xl font-bold mt-2">{accused.name}</p>
                  </motion.div>
                ) : (
                  <p className="text-text-muted">Unknown</p>
                )}
              </Card>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <p className="text-4xl mb-2">🎭</p>
                <p className="text-text-secondary text-lg">Actual Chor</p>
              </motion.div>

              {chor ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <Card>
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
                      style={{ backgroundColor: chor.avatarColor }}
                    >
                      {chor.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xl font-bold mt-2">{chor.name}</p>
                    <p className="text-sm" style={{ color: ROLE_COLORS.chor }}>
                      {ROLE_EMOJIS.chor} Chor
                    </p>
                  </Card>
                </motion.div>
              ) : (
                <p className="text-text-muted">Unknown</p>
              )}

              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                >
                  <Card>
                    <p className={`text-2xl font-bold ${isCorrect ? "text-emerald" : "text-rose"}`}>
                      {isCorrect ? "✅ Police successfully caught the Chor." : "❌ Police accused the wrong player."}
                    </p>
                    {!isCorrect && chor && (
                      <p className="text-text-secondary text-sm mt-2">
                        The real Chor was {chor.name}!
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
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
                <p className="text-xl font-semibold text-gold">
                  {winnerName ? `${winnerName} wins!` : ""}
                </p>
                <p className="text-text-muted text-sm">
                  🏆 Winner: {winnerLabel}
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
                    const stats = playerStatistics[p.id];
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
                          <span>👑 Raja: {stats.timesRaja ?? 0}x</span>
                          <span>📜 Mantri: {stats.timesMantri ?? 0}x</span>
                          <span>🥷 Chor: {stats.timesChor ?? 0}x</span>
                          <span>👮 Police: {stats.timesPolice ?? 0}x</span>
                          <span>✓ Correct: {stats.correctGuesses ?? 0}</span>
                          <span>✗ Wrong: {stats.wrongGuesses ?? 0}</span>
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
              {isHost && (
                <Button variant="ghost" onClick={endGame}>
                  End Game
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
