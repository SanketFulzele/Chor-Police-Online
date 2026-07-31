import { motion } from "framer-motion";
import type { GameRole } from "../../types";
import { CARD_IMAGES } from "../../constants/game";

interface GameCardProps {
  role?: GameRole;
  revealed: boolean;
  onReveal?: () => void;
  onHide?: () => void;
}

export function GameCard({ role, revealed, onReveal, onHide }: GameCardProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        className="relative w-52 sm:w-60 md:w-64 aspect-[1187/1769] cursor-pointer"
        style={{ perspective: 1200 }}
        onClick={revealed ? undefined : onReveal}
        whileHover={revealed ? undefined : { scale: 1.03 }}
        whileTap={revealed ? undefined : { scale: 0.97 }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={CARD_IMAGES.hidden}
              alt="Card back"
              draggable={false}
              className="w-full h-full object-contain object-center"
            />
          </div>

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <img
              src={role ? CARD_IMAGES[role] : CARD_IMAGES.hidden}
              alt={role ?? "Card"}
              draggable={false}
              className="w-full h-full object-contain object-center"
            />
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
