import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Home() {
  const navigate = useNavigate();

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
    </div>
  );
}
