import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { HowToPlayModal } from "../components/ui/HowToPlayModal";

export function Home() {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold gold-gradient text-glow mb-4">
          Chor Police
        </h1>
        <p className="text-text-secondary text-lg md:text-xl max-w-md mx-auto">
          The classic Indian game of wit, strategy, and deception. Play with
          friends in real-time.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-sm space-y-4"
      >
        <Card className="space-y-4">
          <Button
            variant="gold"
            size="lg"
            fullWidth
            onClick={() => navigate("/create")}
          >
            Create Room
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate("/join")}
          >
            Join Room
          </Button>
        </Card>

        <Card className="text-center">
          <p className="text-text-muted text-sm">
            👑 Raja &middot; 👮 Mantri &middot; 🥷 Chor &middot; 🔫 Daku
          </p>
        </Card>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHowToPlay(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] text-text-muted hover:text-text-primary text-sm font-medium transition-all duration-200 shadow-lg backdrop-blur-md"
      >
        <span className="text-base">📖</span>
        <span className="hidden sm:inline">How to Play</span>
      </motion.button>

      <HowToPlayModal open={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  );
}
