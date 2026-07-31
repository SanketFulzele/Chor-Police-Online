import { motion } from "framer-motion";
import type { GameRole } from "../../types";
import { CARD_IMAGES, ROLE_COLORS } from "../../constants/game";

interface GameCardProps {
  role?: GameRole;
  revealed: boolean;
  onReveal?: () => void;
  onHide?: () => void;
}

export function GameCard({ role, revealed, onReveal, onHide }: GameCardProps) {
  const color = role ? ROLE_COLORS[role] : "#64748b";

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative w-36 h-48 cursor-pointer overflow-hidden"
        style={{ perspective: 1000 }}
        onClick={revealed ? undefined : onReveal}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={CARD_IMAGES.hidden}
              alt="Card"
              draggable={false}
              className="w-full h-full object-cover"
            />
          </div>

          <div
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              border: `2px solid ${color}`,
              boxShadow: `0 0 18px ${color}33`,
            }}
          >
            {role ? (
              <img
                src={CARD_IMAGES[role]}
                alt={role}
                draggable={false}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <img
                src={CARD_IMAGES.hidden}
                alt="Card"
                draggable={false}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={revealed}
          onClick={onReveal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Reveal
        </button>
        <button
          type="button"
          disabled={!revealed}
          onClick={onHide}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
