import { motion } from "framer-motion";
import type { GameRole } from "../../types";
import { ROLE_EMOJIS, ROLE_LABELS, ROLE_COLORS } from "../../constants/game";

interface GameCardProps {
  role?: GameRole;
  revealed: boolean;
  disabled?: boolean;
  onReveal?: () => void;
  onHide?: () => void;
  showActions?: boolean;
}

export function GameCard({ role, revealed, disabled, onReveal, onHide, showActions }: GameCardProps) {
  const label = role ? ROLE_LABELS[role] : "?";
  const emoji = role ? ROLE_EMOJIS[role] : "🃏";
  const color = role ? ROLE_COLORS[role] : "#64748b";

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative w-36 h-48 cursor-pointer"
        style={{ perspective: 1000 }}
        onClick={revealed || disabled ? undefined : onReveal}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 rounded-xl border-2 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-6xl">🃏</span>
          </div>

          <div
            className="absolute inset-0 rounded-xl border-2 flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: color,
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            }}
          >
            <div className="text-center">
              <span className="text-5xl block mb-2">{emoji}</span>
              <span
                className="text-lg font-bold block"
                style={{ color }}
              >
                {label}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {showActions && (
        <div className="flex gap-3">
          <button
            type="button"
            disabled={disabled || revealed}
            onClick={onReveal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Reveal
          </button>
          <button
            type="button"
            disabled={disabled || !revealed}
            onClick={onHide}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Hide
          </button>
        </div>
      )}
    </div>
  );
}
