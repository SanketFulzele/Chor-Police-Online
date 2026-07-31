import { motion } from "framer-motion";
import { CARD_IMAGES } from "../../constants/game";

export function ShuffleAnimation() {
  const cards = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {cards.map((i) => (
        <motion.div
          key={i}
          className="w-14 h-20 rounded-lg border border-white/20 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={{
            x: [0, i % 2 === 0 ? -40 : 40, 0],
            y: [0, i % 2 === 0 ? -20 : 20, 0],
            rotate: [0, i % 2 === 0 ? -15 : 15, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        >
          <img
            src={CARD_IMAGES.hidden}
            alt="Card"
            draggable={false}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}
