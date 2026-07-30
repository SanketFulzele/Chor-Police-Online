import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useRoomStore } from "../store/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const room = useRoomStore((s) => s.room);

  useEffect(() => {
    if (!room) {
      navigate("/");
    }
  }, [room, navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg space-y-6 text-center"
      >
        <Card>
          <h2 className="text-2xl font-bold gold-gradient mb-2">
            Game Starting...
          </h2>
          <p className="text-text-secondary">
            {room?.players.map((p) => p.name).join(", ")}
          </p>
          <p className="text-text-muted text-sm mt-2">
            Round {room?.round ?? 1}
          </p>
        </Card>
        <Button variant="ghost" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
