import { motion } from "framer-motion";
import type { Player } from "../../types";
import { RoleIcon } from "./RoleIcon";
import { CrownIcon } from "../ui/CrownIcon";

interface PlayerListProps {
  players: Player[];
  playerId: string | null;
}

export function PlayerList({ players, playerId }: PlayerListProps) {
  return (
    <div className="space-y-2.5">
      {players.map((p, i) => {
        const isYou = p.id === playerId;
        const isPublicRaja = p.publicRole === "raja";
        const isPublicMantri = p.publicRole === "mantri";
        return (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className={`relative flex items-center gap-3.5 rounded-2xl border px-3.5 py-3 transition-all duration-300 ${
              isYou
                ? "border-gold/50 bg-gradient-to-br from-gold/[0.12] via-surface/80 to-transparent shadow-[0_0_25px_rgba(255,215,0,0.12)]"
                : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
            } ${!p.isConnected ? "opacity-50" : ""}`}
          >
            <div className="relative shrink-0">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white ring-1 ${
                  isYou ? "ring-gold/60" : "ring-white/10"
                }`}
                style={{ backgroundColor: p.avatarColor }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              {p.isConnected ? (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-50" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#0d0d1f] bg-emerald" />
                </span>
              ) : (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0d0d1f] bg-rose" />
              )}
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-text-primary">
                {p.name}
                {isYou && (
                  <span className="ml-1.5 rounded-md bg-gold px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-black">
                    You
                  </span>
                )}
                {p.isHost && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-gold/80">
                    <CrownIcon className="h-3 w-3" strokeWidth={2.5} />
                    Host
                  </span>
                )}
              </p>
              {!p.isConnected && (
                <p className="mt-0.5 text-[11px] font-medium text-rose">
                  Disconnected
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isPublicRaja && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/[0.08] px-2 py-1 text-[11px] font-bold text-gold">
                  <RoleIcon role="raja" className="h-4 w-4" />
                  Raja
                </span>
              )}
              {isPublicMantri && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-[11px] font-bold text-purple-400">
                  <RoleIcon role="mantri" className="h-4 w-4" />
                  Mantri
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
