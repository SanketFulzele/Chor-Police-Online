import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSocketStore } from "../store/socketStore";
import { useRoomStore } from "../store/roomStore";
import { Button } from "../components/ui/Button";
import { CrownIcon } from "../components/ui/CrownIcon";
import { RoyalPanel } from "../components/ui/RoyalPanel";
import { PremiumBackground } from "../components/layout/PremiumBackground";
import { useRoom } from "../hooks/useRoom";
import { SocketEvents } from "../../shared/socket/events";
import { loadSession, clearSession } from "../utils/session";
import { MAX_PLAYERS, MIN_PLAYERS } from "../constants/game";

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
}

function CopyButton({ copied, onClick }: CopyButtonProps) {
  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        aria-label={copied ? "Room code copied" : "Copy room code"}
        title={copied ? "Copied" : "Copy room code"}
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 cursor-pointer ${
          copied
            ? "border-emerald/60 bg-emerald/15 text-emerald shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            : "border-gold/30 bg-gold/[0.06] text-gold/80 hover:border-gold/60 hover:bg-gold/[0.12] hover:text-gold hover:shadow-[0_0_25px_rgba(255,215,0,0.18)]"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ opacity: 0, scale: 0.5, rotate: copied ? -20 : 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
              </svg>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <motion.span
        initial={false}
        animate={copied ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 4, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        aria-hidden="true"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald px-2.5 py-1 text-xs font-semibold text-black shadow-lg"
      >
        Copied ✓
      </motion.span>
    </div>
  );
}

export function Room() {
  const navigate = useNavigate();
  const { room, myPlayer, isHost, leaveRoom, toggleReady, startGame } =
    useRoom();
  const status = useSocketStore((s) => s.status);
  const socket = useSocketStore((s) => s.socket);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!room && status === "connected") {
      const session = loadSession();
      if (session) {
        const timer = setTimeout(() => {
          if (!useRoomStore.getState().room) {
            clearSession();
            navigate("/");
          }
        }, 5000);
        return () => clearTimeout(timer);
      } else {
        navigate("/");
      }
    }
  }, [room, status, navigate]);

  useEffect(() => {
    if (!socket) return;

    const handleGameStarting = () => {
      navigate("/game");
    };

    socket.on(SocketEvents.GAME_STARTING, handleGameStarting);
    return () => {
      socket.off(SocketEvents.GAME_STARTING, handleGameStarting);
    };
  }, [socket, navigate]);

  if (!room) return null;

  const allReady =
    room.players.length >= MIN_PLAYERS &&
    room.players.every((p) => p.isReady || p.isHost);
  const canStart = allReady && isHost;

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

  const missingPlayers = MAX_PLAYERS - room.players.length;
  const hasMinimum = room.players.length >= MIN_PLAYERS;
  const allHereAndReady = hasMinimum && allReady;
  const bannerText = allHereAndReady
    ? "All players ready!"
    : missingPlayers > 0 && !hasMinimum
    ? `Waiting for ${missingPlayers} more player${missingPlayers > 1 ? "s" : ""}`
    : "Waiting for all players to be ready";

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-10 overflow-x-hidden">
      <PremiumBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-xl space-y-5"
      >
        {/* ── Room Code Hero ─────────────────────────────────────────── */}
        <section className="text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-gold/20 to-transparent border border-gold/30 shadow-[0_0_40px_rgba(255,215,0,0.25)] mb-4"
          >
            <CrownIcon className="w-5 h-5 text-gold" />
          </motion.div>

          <p className="text-[11px] tracking-[0.35em] uppercase text-gold/70 mb-3">
            Room Code
          </p>

          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-[0.2em] gold-gradient text-glow leading-none select-all">
              {room.code}
            </h1>
            <CopyButton copied={copied} onClick={handleCopyCode} />
          </div>

          <div className="flex items-center justify-center gap-3 mt-4 mb-4">
            <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-gold/60" />
            <span className="w-2 h-2 rotate-45 bg-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
            <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-gold/60" />
          </div>

          <p className="text-text-secondary text-sm md:text-base">
            Share this room code with your friends
          </p>
        </section>

        {/* ── Player Panel ───────────────────────────────────────────── */}
        <RoyalPanel className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-white/[0.06]">
            <h3 className="text-base font-bold tracking-wide text-text-primary">
              Players{" "}
              <span className="text-text-muted text-sm font-medium">
                ({room.players.length}/{MAX_PLAYERS})
              </span>
            </h3>
            {status === "connected" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                </span>
                Connected
              </span>
            )}
            {status === "connecting" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber">
                <span className="h-2 w-2 rounded-full bg-amber" />
                Connecting...
              </span>
            )}
            {status === "disconnected" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose">
                <span className="h-2 w-2 rounded-full bg-rose" />
                Disconnected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence initial={false}>
              {room.players.map((player, i) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 h-full transition-all duration-300 ${
                    player.isConnected
                      ? "bg-white/[0.03] border-white/[0.08] hover:border-gold/30 hover:bg-white/[0.06] hover:shadow-[0_0_25px_rgba(255,215,0,0.07)]"
                      : "bg-white/[0.01] border-white/[0.05] opacity-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white ring-1 ring-white/10"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    {player.isConnected ? (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-50" />
                        <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#0d0d1f] bg-emerald" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0d0d1f] bg-rose" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {player.name}
                      {player.id === myPlayer?.id && (
                        <span className="ml-1.5 text-xs font-normal text-text-muted">
                          (You)
                        </span>
                      )}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {player.isHost && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-b from-gold-light to-gold-dark px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-[0_0_12px_rgba(255,215,0,0.35)]">
                          <CrownIcon className="h-3 w-3" strokeWidth={2.5} />
                          Host
                        </span>
                      )}
                      {player.isReady ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Ready
                        </span>
                      ) : (
                        !player.isHost &&
                        player.isConnected && (
                          <span className="text-[11px] font-medium text-text-muted">
                            Not ready
                          </span>
                        )
                      )}
                      {!player.isConnected && (
                        <span className="text-[11px] font-medium text-rose">
                          Disconnected
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {Array.from({ length: MAX_PLAYERS - room.players.length }).map((_, i) => (
              <motion.div
                key={`empty-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (room.players.length + i) * 0.08, duration: 0.4 }}
                className="flex items-center gap-3 rounded-xl border border-dashed border-gold/15 bg-white/[0.015] px-3 py-3 h-full opacity-70"
              >
                <motion.div
                  animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: i * 0.4 }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04]"
                >
                  <span className="text-base font-medium text-text-muted">?</span>
                </motion.div>
                <p className="truncate text-sm text-text-muted">Waiting for player...</p>
              </motion.div>
            ))}
          </div>
        </RoyalPanel>

        {/* ── Waiting Status Banner ──────────────────────────────────── */}
        <div
          role="status"
          aria-live="polite"
          className={`relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 ${
            allHereAndReady
              ? "border-emerald/25 bg-emerald/[0.06]"
              : "border-royal/35 bg-royal/[0.09]"
          }`}
        >
          <div
            aria-hidden="true"
            className={`absolute -inset-x-10 -top-16 h-32 rounded-full blur-3xl animate-glow-pulse ${
              allHereAndReady ? "bg-emerald/[0.18]" : "bg-royal/[0.18]"
            }`}
          />
          <span className="relative text-xl leading-none">
            {allHereAndReady ? "🚀" : "👥"}
          </span>
          <p
            className={`relative text-sm sm:text-base font-bold tracking-wide ${
              allHereAndReady ? "text-emerald" : "text-gold"
            }`}
          >
            {bannerText}
          </p>
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              leaveRoom();
              navigate("/");
            }}
            className="group flex w-full sm:flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-gold/25 bg-[#0d0d1f]/80 px-6 py-3.5 text-base font-semibold tracking-wide text-gold/80 transition-all duration-300 hover:border-gold/60 hover:bg-[#12122a]/80 hover:text-gold hover:shadow-[0_0_30px_rgba(255,215,0,0.12)]"
          >
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Leave Room
          </motion.button>

          {!isHost && (
            <Button
              variant={myPlayer?.isReady ? "secondary" : "gold-gradient"}
              size="lg"
              fullWidth
              className="sm:flex-1"
              onClick={toggleReady}
            >
              {myPlayer?.isReady ? "Not Ready" : "Ready"}
            </Button>
          )}

          {isHost && (
            <Button
              variant="gold-gradient"
              size="lg"
              fullWidth
              className="sm:flex-1"
              disabled={!canStart || starting}
              onClick={handleStartGame}
            >
              {starting ? "Starting..." : "Start Game"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
