import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { usePersistence } from "../hooks/usePersistence";
import { ROLE_EMOJIS, ROLE_LABELS } from "../constants/game";
import type { StoredGame } from "../types";

export function History() {
  const navigate = useNavigate();
  const { loadHistory, clearHistory } = usePersistence();
  const [games, setGames] = useState(loadHistory);
  const [selectedGame, setSelectedGame] = useState<StoredGame | null>(null);

  function handleClear() {
    clearHistory();
    setGames([]);
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gold-gradient">Game History</h2>
          <div className="flex gap-2">
            {games.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Back
            </Button>
          </div>
        </div>

        {games.length === 0 && (
          <Card>
            <p className="text-text-muted text-center py-8">
              No games played yet. Start a game to see history here!
            </p>
          </Card>
        )}

        <AnimatePresence>
          {selectedGame ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                className="text-sm text-gold hover:underline cursor-pointer"
              >
                ← Back to list
              </button>

              <Card>
                <p className="text-2xl mb-1">🏆 {selectedGame.winnerName}</p>
                <p className="text-text-muted text-xs mb-4">
                  {new Date(selectedGame.date).toLocaleDateString()} &middot; {selectedGame.roundsPlayed} rounds
                </p>
                <div className="space-y-2">
                  {selectedGame.players
                    .sort((a, b) => b.score - a.score)
                    .map((p, i) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between glass rounded-xl px-4 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm w-6">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                          </span>
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.id === selectedGame.winnerId && (
                            <span className="text-xs text-gold">👑</span>
                          )}
                        </div>
                        <span className="font-mono text-sm">{p.score}</span>
                      </div>
                    ))}
                </div>
              </Card>

              {selectedGame.roundHistory.length > 0 && (
                <Card>
                  <p className="text-sm font-semibold mb-3">Round Details</p>
                  <div className="space-y-2">
                    {selectedGame.roundHistory.map((r) => (
                      <div key={r.round} className="glass rounded-xl px-4 py-2 text-xs text-left">
                        <p className="font-medium mb-1">Round {r.round}</p>
                        <div className="text-text-muted space-y-0.5">
                          {Object.entries(r.roles).map(([pid, role]) => {
                            const player = selectedGame.players.find((p) => p.id === pid);
                            return (
                              <span key={pid} className="block">
                                {player?.name ?? pid}: {ROLE_EMOJIS[role]} {ROLE_LABELS[role]}
                                {r.mantriId === pid && " (Mantri)"}
                                {r.chosenId === pid && " ← Chosen"}
                              </span>
                            );
                          })}
                          <p className={r.correct ? "text-emerald mt-1" : "text-rose mt-1"}>
                            {r.correct ? "✓ Correct guess" : "✗ Wrong guess"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-3">
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  layoutId={game.id}
                  className="glass rounded-xl px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setSelectedGame(game)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        🏆 {game.winnerName}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(game.date).toLocaleDateString()} &middot; {game.roundsPlayed} rounds
                      </p>
                    </div>
                    <span className="text-xs text-gold">{game.players.length} players</span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {game.players.map((p) => (
                      <span
                        key={p.id}
                        className="text-xs bg-white/5 rounded-full px-2 py-0.5"
                      >
                        {p.name} ({p.score})
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
