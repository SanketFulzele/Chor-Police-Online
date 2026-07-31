import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { RoleIcon } from "../game/RoleIcon";
import { ROLE_LABELS, ROLE_COLORS } from "../../constants/game";
import type { GameRole } from "../../types";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#1a1a2e] p-6 md:p-8 shadow-2xl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <p className="text-3xl">📖</p>
                <h2 className="text-xl font-bold gold-gradient">How to Play Chor Police</h2>
                <p className="text-sm text-text-muted">Learn the rules before starting your first game.</p>
              </div>

              {/* Before You Start */}
              <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-2.5">
                  <span className="text-base">⚡</span> Before You Start
                </h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald shrink-0 mt-0.5">•</span>
                    <span>Exactly <strong>4 players</strong> are required.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald shrink-0 mt-0.5">•</span>
                    <span>Every player should open the game on their own device.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald shrink-0 mt-0.5">•</span>
                    <span>All players must stay connected to the internet throughout the game.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald shrink-0 mt-0.5">•</span>
                    <span>Using the same Wi-Fi is recommended for lower latency.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald shrink-0 mt-0.5">•</span>
                    <span>One player creates a room; others join using the Room Code.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald shrink-0 mt-0.5">•</span>
                    <span>Wait until all four players have joined before starting.</span>
                  </li>
                </ul>
              </section>

              {/* Game Roles */}
              <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-2.5">
                  <span className="text-base">🎭</span> Game Roles
                </h3>
                <p className="text-sm text-text-muted mb-3">There are four roles — every player receives one at random.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["raja", "mantri", "sipahi", "chor"] as GameRole[]).map((role) => (
                    <div key={role} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-center">
                      <RoleIcon role={role} className="w-8 h-8 mx-auto block" />
                      <span className="text-xs font-semibold mt-1 block" style={{ color: ROLE_COLORS[role] }}>
                        {ROLE_LABELS[role]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-2.5">
                  Only you can see your own role card unless the game reveals it.
                </p>
              </section>

              {/* Game Flow */}
              <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <span className="text-base">🎮</span> Game Flow
                </h3>
                <ol className="space-y-2.5 text-sm text-text-secondary">
                  {[
                    "The Host creates a room.",
                    "The other three players join using the Room Code.",
                    "The Host starts the game.",
                    "Each player may reveal or hide their own role card at any time.",
                    "When the Raja reveals their card, everyone will know who the Raja is.",
                    'The Raja clicks "Ask: Who is my Mantri?"',
                    "The Mantri is revealed to everyone.",
                    "Only the Mantri receives a popup showing the remaining two hidden players. The Mantri must select the player they believe is the Chor.",
                    "The result is revealed to everyone — ✅ Correct or ❌ Wrong.",
                    "Scores are awarded. Players may continue to the next round.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Scoring */}
              <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-2.5">
                  <span className="text-base">🏆</span> Scoring
                </h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-gold shrink-0 mt-0.5">•</span>
                    <span>Each round awards points based on the game outcome.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold shrink-0 mt-0.5">•</span>
                    <span>Rankings are updated after every round.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold shrink-0 mt-0.5">•</span>
                    <span>Score history is recorded and visible on the leaderboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold shrink-0 mt-0.5">•</span>
                    <span>The player with the highest total score after all rounds wins!</span>
                  </li>
                </ul>
              </section>

              {/* Important Rules */}
              <section className="rounded-xl border border-yellow-500/20 bg-yellow-900/10 px-4 py-3.5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-2.5 text-yellow-400">
                  <span className="text-base">⚠️</span> Important Rules
                </h3>
                <ul className="space-y-1.5 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 shrink-0 mt-0.5">✔</span>
                    <span>Do not share your role with other players.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 shrink-0 mt-0.5">✔</span>
                    <span>Only reveal your role when the game allows or if you choose to view your own private card.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 shrink-0 mt-0.5">✔</span>
                    <span>Stay connected until the round finishes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 shrink-0 mt-0.5">✔</span>
                    <span>If someone disconnects, wait until they reconnect before continuing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 shrink-0 mt-0.5">✔</span>
                    <span>Play honestly and avoid revealing hidden information outside the game.</span>
                  </li>
                </ul>
              </section>

              {/* Tips */}
              <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-2.5">
                  <span className="text-base">💡</span> Tips
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-secondary">
                  {[
                    "Use one device per player.",
                    "Play in the same room for the best experience.",
                    "Keep your role secret unless the game reveals it.",
                    "Watch the leaderboard after every round to see who is leading.",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                      <span className="shrink-0">💡</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Bottom button */}
            <div className="mt-6 text-center">
              <Button variant="gold" size="lg" fullWidth onClick={onClose}>
                Got It, Let's Play!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
