import { motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import type { GameRole } from "../../types";
import { CARD_IMAGES, ROLE_LABELS } from "../../constants/game";

interface GameCardProps {
  role?: GameRole;
  revealed: boolean;
  onReveal?: () => void;
  onHide?: () => void;
}

function EyeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

const REVEAL_PARTICLES = [
  { className: "-top-6 left-8", delay: 0 },
  { className: "-top-4 right-10", delay: 0.12 },
  { className: "-bottom-6 left-12", delay: 0.2 },
  { className: "-bottom-4 right-6", delay: 0.08 },
  { className: "top-1/3 -left-8", delay: 0.16 },
  { className: "top-1/2 -right-8", delay: 0.04 },
] as const;

export function GameCard({ role, revealed, onReveal, onHide }: GameCardProps) {
  const roleLabel = role ? ROLE_LABELS[role] : "role";

  const handleToggle = () => {
    if (revealed) {
      onHide?.();
    } else {
      onReveal?.();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-7">
      {/* Magical circle + glow behind the card */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 sm:w-96 sm:h-96">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.14),transparent_62%)] animate-glow-pulse" />
        <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.12),transparent_70%)]" />
        <div className="absolute inset-0 rounded-full border border-gold/20" />
        <div className="absolute inset-4 rounded-full border border-dashed border-gold/15 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border border-gold/10" />
      </div>

      {/* Card wrap */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={revealed}
        aria-label={revealed ? `Hide your ${roleLabel} card` : "Reveal your role card"}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="relative aspect-[1187/1769] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-gold/80 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-2xl w-56 sm:w-64 md:w-72"
        style={{ perspective: 1200 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Golden aura, swells when revealed */}
        <motion.div
          aria-hidden="true"
          className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle,rgba(255,215,0,0.4),transparent_70%)] blur-xl"
          animate={{ opacity: revealed ? 0.9 : 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        {/* Gold frame edge */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gold/40 via-gold/10 to-transparent blur-[2px]"
        />

        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl" style={{ backfaceVisibility: "hidden" }}>
            <img
              src={CARD_IMAGES.hidden}
              alt="Card back"
              draggable={false}
              className="w-full h-full object-contain object-center pointer-events-none"
            />
          </div>

          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <img
              src={role ? CARD_IMAGES[role] : CARD_IMAGES.hidden}
              alt={role ?? "Card"}
              draggable={false}
              className="w-full h-full object-contain object-center pointer-events-none"
            />
          </div>
        </motion.div>

        {/* Cinematic reveal flash */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(255,237,74,0.5),transparent_70%)] pointer-events-none"
          animate={revealed ? { opacity: [0, 1, 0], scale: [0.95, 1.08, 1] } : { opacity: 0, scale: 1 }}
          transition={{ duration: 0.85, times: [0, 0.35, 1], ease: "easeOut" }}
        />

        {/* Gold particles on reveal */}
        {revealed &&
          REVEAL_PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className={`absolute ${p.className} w-1.5 h-1.5 rounded-full bg-gold-light shadow-[0_0_10px_rgba(255,215,0,0.9)]`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0], y: [0, -12] }}
              transition={{ duration: 1, delay: p.delay, ease: "easeOut" }}
            />
          ))}
      </motion.div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReveal}
          disabled={revealed}
          aria-label="Reveal your role card"
          className="group flex items-center gap-2.5 rounded-xl px-7 py-3 text-sm font-bold text-white border border-royal-light/40 bg-gradient-to-b from-royal-light via-royal to-purple-900 shadow-[0_10px_40px_rgba(124,58,237,0.4)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(124,58,237,0.6)] hover:border-royal-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_40px_rgba(124,58,237,0.4)]"
        >
          <EyeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
          Reveal
        </button>
        <button
          type="button"
          onClick={onHide}
          disabled={!revealed}
          aria-label="Hide your role card"
          className="group flex items-center gap-2.5 rounded-xl px-7 py-3 text-sm font-bold text-text-primary border border-white/10 bg-gradient-to-b from-surface-light to-surface shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:border-gold/40 hover:text-gold hover:shadow-[0_16px_45px_rgba(0,0,0,0.6)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:text-text-primary disabled:hover:border-white/10 disabled:hover:shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        >
          <EyeOffIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
          Hide
        </button>
      </div>
    </div>
  );
}
