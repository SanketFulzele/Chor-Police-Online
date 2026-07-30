import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSocketStore } from "../store/socketStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useRoom } from "../hooks/useRoom";
import { SocketEvents } from "../../shared/socket/events";

export function Room() {
  const navigate = useNavigate();
  const { room, myPlayer, isHost, leaveRoom, toggleReady, startGame } =
    useRoom();
  const status = useSocketStore((s) => s.status);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!room && status === "connected") {
      navigate("/");
    }
  }, [room, status, navigate]);

  useEffect(() => {
    const socket = useSocketStore.getState().socket;
    if (!socket) return;

    const handleGameStarting = () => {
      navigate("/game");
    };

    socket.on(SocketEvents.GAME_STARTING, handleGameStarting);
    return () => {
      socket.off(SocketEvents.GAME_STARTING, handleGameStarting);
    };
  }, [navigate]);

  if (!room) return null;

  const allReady =
    room.players.length === 4 &&
    room.players.every((p) => p.isReady || p.isHost);
  const canStart = room.players.length === 4 && allReady && isHost;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartGame = () => {
    setStarting(true);
    startGame();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <p className="text-text-muted text-sm mb-1">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-4xl md:text-5xl font-bold tracking-[0.2em] gold-gradient text-glow">
              {room.code}
            </p>
            <motion.button
              onClick={handleCopyCode}
              whileTap={{ scale: 0.9 }}
              className="glass rounded-lg p-2 cursor-pointer hover:bg-white/10 transition-colors"
              title="Copy room code"
            >
              {copied ? (
                <svg
                  className="w-5 h-5 text-emerald"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </motion.button>
          </div>
          <p className="text-text-muted text-sm mt-2">
            Share this code with your friends
          </p>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">
              Players ({room.players.length}/4)
            </h3>
            {status === "disconnected" && (
              <span className="text-xs text-rose">Disconnected</span>
            )}
            {status === "connecting" && (
              <span className="text-xs text-amber">Connecting...</span>
            )}
            {status === "connected" && (
              <span className="text-xs text-emerald">Connected</span>
            )}
          </div>

          {room.players.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                player.isConnected
                  ? "glass border-border"
                  : "bg-white/3 border border-white/5 opacity-60"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary truncate">
                    {player.name}
                    {player.id === myPlayer?.id && (
                      <span className="text-text-muted text-xs ml-1">(You)</span>
                    )}
                  </p>
                  {player.isHost && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">
                      Host
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!player.isConnected && (
                  <span className="text-xs text-rose">Disconnected</span>
                )}
                <div
                  className={`w-3 h-3 rounded-full ${
                    player.isReady
                      ? "bg-emerald shadow-sm shadow-emerald/50"
                      : "bg-text-muted"
                  }`}
                />
              </div>
            </motion.div>
          ))}

          {Array.from({ length: 4 - room.players.length }).map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (room.players.length + i) * 0.1 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-dashed border-white/10"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-text-muted text-lg">?</span>
              </div>
              <p className="text-text-muted text-sm">
                Waiting for player...
              </p>
            </motion.div>
          ))}
        </Card>

        <div className="space-y-3">
          {!isHost && (
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                variant={myPlayer?.isReady ? "secondary" : "gold"}
                size="lg"
                fullWidth
                onClick={toggleReady}
              >
                {myPlayer?.isReady ? "Not Ready" : "Ready"}
              </Button>
            </motion.div>
          )}

          {isHost && (
            <Button
              variant="gold"
              size="lg"
              fullWidth
              disabled={!canStart || starting}
              onClick={handleStartGame}
            >
              {starting
                ? "Starting..."
                : canStart
                ? "Start Game"
                : room.players.length < 4
                ? `Waiting for ${4 - room.players.length} more player${
                    4 - room.players.length > 1 ? "s" : ""
                  }`
                : "Waiting for all players to be ready"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => {
              leaveRoom();
              navigate("/");
            }}
          >
            Leave Room
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
