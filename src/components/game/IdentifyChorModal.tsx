import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoyalPanel } from "../ui/RoyalPanel";
import type { Player } from "../../types";

interface IdentifyChorModalProps {
  hiddenPlayers: Player[];
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IdentifyChorModal({
  hiddenPlayers,
  selectedPlayerId,
  onSelect,
  onConfirm,
  onCancel,
}: IdentifyChorModalProps) {
  const selected = (id: string) => selectedPlayerId === id;

  useEffect(() => {
    const el = document.getElementById("mantri-modal");
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && el && !el.classList.contains("hidden")) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      id="mantri-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="identify-chor-title"
      aria-describedby="identify-chor-subtitle"
      className="hidden fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop: blur + dark overlay + soft vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-modal-overlay"
      />
      <div aria-hidden="true" className="absolute inset-0 vignette animate-modal-overlay" />

      {/* Panel */}
      <div className="relative w-full max-w-md animate-modal-panel">
        <RoyalPanel decorativeCorners className="px-5 py-7 sm:px-8 sm:py-8">
          <div className="relative space-y-6">
            {/* Ambient glows */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-64 rounded-full bg-gold/[0.08] blur-3xl animate-glow-pulse"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-48 w-64 rounded-full bg-rose/[0.07] blur-3xl"
            />

            {/* Header */}
            <div className="text-center space-y-3">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-rose/[0.18] to-transparent border border-rose/30 shadow-[0_0_40px_rgba(239,68,68,0.25)]"
              >
                <span className="text-2xl leading-none">👁️</span>
              </motion.div>

              <h2
                id="identify-chor-title"
                className="text-2xl sm:text-3xl font-black tracking-[0.16em] gold-gradient text-glow"
              >
                IDENTIFY THE CHOR
              </h2>

              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-gold/60" />
                <span className="w-1.5 h-1.5 rotate-45 bg-gold shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                <span className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-gold/60" />
              </div>

              <p
                id="identify-chor-subtitle"
                className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto"
              >
                Choose carefully. One decision determines the outcome.
              </p>
            </div>

            {/* Suspect selection */}
            <div className="pt-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold/70 text-center mb-4">
                Select the Chor
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {hiddenPlayers.map((p, i) => {
                  const isSelected = selected(p.id);
                  return (
                    <div
                      key={p.id}
                      className="animate-modal-item"
                      style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => onSelect(p.id)}
                        animate={{ scale: isSelected ? 1.06 : 1 }}
                        whileHover={{ y: -4, scale: isSelected ? 1.09 : 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        aria-pressed={isSelected}
                        aria-label={`Select ${p.name} as the Chor`}
                        className={`relative w-32 sm:w-36 rounded-2xl border px-3 py-4 flex flex-col items-center gap-3 cursor-pointer outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-gold/70 ${
                          isSelected
                            ? "border-gold bg-gradient-to-b from-gold/[0.16] via-white/[0.03] to-transparent"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-gold/40 hover:bg-white/[0.06]"
                        }`}
                      >
                        {isSelected && (
                          <motion.span
                            aria-hidden="true"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -inset-2 rounded-3xl bg-gold/25 blur-xl animate-glow-pulse"
                          />
                        )}

                        <div
                          className={`relative w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 transition-all duration-300 ${
                            isSelected
                              ? "border-gold shadow-[0_0_22px_rgba(255,215,0,0.45)]"
                              : "border-white/10"
                          }`}
                          style={{ backgroundColor: p.avatarColor }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.span
                                key="check"
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 420, damping: 17 }}
                                className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-b from-gold-light to-gold-dark text-black shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                              >
                                <CheckIcon />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        <span
                          className={`text-sm font-semibold truncate max-w-full ${
                            isSelected ? "text-gold" : "text-text-primary"
                          }`}
                        >
                          {p.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted">
                          Suspect
                        </span>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <motion.button
                type="button"
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-xl px-6 py-3.5 text-sm font-bold text-text-primary border border-gold/30 bg-gradient-to-b from-surface-light to-surface shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:border-gold/60 hover:text-gold hover:shadow-[0_0_30px_rgba(255,215,0,0.12)] transition-all duration-300 cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={onConfirm}
                disabled={!selectedPlayerId}
                whileHover={selectedPlayerId ? { scale: 1.03, y: -2 } : {}}
                whileTap={selectedPlayerId ? { scale: 0.97 } : {}}
                className="group flex-1 flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-black tracking-wide text-black bg-gradient-to-b from-gold-light via-gold to-gold-dark shadow-[0_10px_40px_rgba(255,215,0,0.35)] hover:shadow-[0_16px_50px_rgba(255,215,0,0.55)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 cursor-pointer"
              >
                <CheckIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                Confirm
              </motion.button>
            </div>
          </div>
        </RoyalPanel>
      </div>
    </div>
  );
}
