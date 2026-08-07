import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import { RoyalPanel } from "../components/ui/RoyalPanel";
import { PremiumBackground } from "../components/layout/PremiumBackground";
import { RankingList } from "../components/game/victory/RankingList";
import { IconCheck, IconHistory, IconHome, IconTrophy, IconX } from "../components/game/victory/icons";
import { usePersistence } from "../hooks/usePersistence";
import { RoleIcon } from "../components/game/RoleIcon";
import { ROLE_COLORS, ROLE_LABELS } from "../constants/game";
import type { StoredGame } from "../types";

const AVATAR_PALETTE = ["#7c3aed", "#2563eb", "#db2777", "#ea580c", "#0d9488", "#ca8a04"];

export function History() {
  const navigate = useNavigate();
  const { loadHistory, clearHistory } = usePersistence();
  const [games, setGames] = useState(loadHistory);
  const [selectedGame, setSelectedGame] = useState<StoredGame | null>(null);

  function handleClear() {
    clearHistory();
    setGames([]);
  }

  const standings = selectedGame
    ? [...selectedGame.players]
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({
          id: p.id,
          name: p.name,
          avatarColor: AVATAR_PALETTE[i % AVATAR_PALETTE.length],
          total: p.score,
        }))
    : [];

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 py-8">
      <PremiumBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <IconTrophy className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-black tracking-wide gold-gradient">Game History</h2>
            </div>
            <p className="mt-1 text-xs text-text-muted">Royal records of every game played</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {games.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button variant="outline-gold" size="sm" onClick={() => navigate("/")}>
              <span className="inline-flex items-center gap-1.5">
                <IconHome className="h-3.5 w-3.5" />
                Back
              </span>
            </Button>
          </div>
        </div>

        {games.length === 0 && (
          <RoyalPanel decorativeCorners className="px-6 py-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <IconHistory className="h-6 w-6" />
              </span>
              <p className="font-bold text-text-primary">No games played yet</p>
              <p className="text-sm text-text-muted">Start a game to see history here!</p>
            </div>
          </RoyalPanel>
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
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-gold transition-colors hover:text-gold-light hover:underline"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              <RoyalPanel decorativeCorners className="p-5 sm:p-6">
                <div className="text-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 16 }}
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold shadow-[0_0_25px_rgba(255,215,0,0.25)]"
                  >
                    <IconTrophy className="h-6 w-6" />
                  </motion.span>
                  <p className="mt-3 text-xl font-black tracking-wide gold-gradient">{selectedGame.winnerName}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {new Date(selectedGame.date).toLocaleDateString()} &middot; {selectedGame.roundsPlayed} rounds
                  </p>
                </div>
                <div className="mt-6">
                  <RankingList players={standings} playerId={null} />
                </div>
              </RoyalPanel>

              {selectedGame.roundHistory.length > 0 && (
                <RoyalPanel className="p-5 sm:p-6">
                  <p className="mb-4 text-base font-bold gold-gradient">Round Details</p>
                  <div className="space-y-3">
                    {selectedGame.roundHistory.map((r) => (
                      <div key={r.round} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-left text-xs">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="font-bold text-text-primary">Round {r.round}</p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                              r.correct ? "bg-emerald/15 text-emerald" : "bg-rose/15 text-rose-400"
                            }`}
                          >
                            {r.correct ? <IconCheck className="h-3 w-3" /> : <IconX className="h-3 w-3" />}
                            {r.correct ? "Correct" : "Wrong"}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-text-secondary">
                          {Object.entries(r.roles).map(([pid, role]) => {
                            const player = selectedGame.players.find((p) => p.id === pid);
                            const points = r.scores?.[pid] ?? 0;
                            return (
                              <div key={pid} className="flex items-center justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-1.5">
                                  <RoleIcon role={role} className="h-4 w-4 shrink-0" />
                                  <span className="truncate font-medium text-text-primary">{player?.name ?? pid}</span>
                                  <span style={{ color: ROLE_COLORS[role] }} className="shrink-0 font-semibold">
                                    {ROLE_LABELS[role]}
                                  </span>
                                  {r.policeId === pid && (
                                    <span className="shrink-0 font-medium text-purple-400">· Police</span>
                                  )}
                                  {r.chosenId === pid && <span className="shrink-0 font-medium text-rose-400">· Chosen</span>}
                                </span>
                                <span className="shrink-0 font-mono font-bold text-emerald-400">
                                  {points > 0 ? `+${points}` : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </RoyalPanel>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-3">
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  layoutId={game.id}
                  className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 transition-all duration-300 hover:border-gold/30 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(255,215,0,0.07)]"
                  onClick={() => setSelectedGame(game)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                        <IconTrophy className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-text-primary">{game.winnerName}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(game.date).toLocaleDateString()} &middot; {game.roundsPlayed} rounds
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-gold/25 bg-gold/[0.06] px-2.5 py-0.5 text-[11px] font-bold text-gold/90">
                      {game.players.length} players
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {game.players.map((p) => (
                      <span key={p.id} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-text-secondary">
                        {p.name} <span className="font-mono font-bold text-gold/80">{p.score}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
