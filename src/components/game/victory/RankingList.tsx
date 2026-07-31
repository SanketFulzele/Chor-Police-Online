import { motion } from "framer-motion";
import { CrownIcon } from "../../ui/CrownIcon";
import { useCountUp } from "./CountUp";
import { IconMedal } from "./icons";
import { placeLabel } from "./types";
import type { RankedPlayer } from "./types";

interface RankingListProps {
  players: RankedPlayer[];
  playerId: string | null;
}

export function RankingList({ players, playerId }: RankingListProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {players.map((p, i) => (
        <RankingCard key={p.id} player={p} rank={i} isYou={p.id === playerId} />
      ))}
    </div>
  );
}

interface RankingCardProps {
  player: RankedPlayer;
  rank: number;
  isYou: boolean;
}

export function RankingCard({ player, rank, isYou }: RankingCardProps) {
  const total = useCountUp(player.total);
  const isFirst = rank === 0;
  const isSecond = rank === 1;
  const isThird = rank === 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2 + rank * 0.09, duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-300 ${
        isFirst
          ? "sm:col-span-2 border-gold/50 bg-gradient-to-br from-gold/[0.14] via-[#1a1530]/90 to-transparent shadow-[0_0_35px_rgba(255,215,0,0.16)] hover:shadow-[0_0_50px_rgba(255,215,0,0.28)]"
          : isSecond
          ? "border-white/20 bg-gradient-to-br from-white/[0.09] to-transparent shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:shadow-[0_0_35px_rgba(255,255,255,0.1)]"
          : isThird
          ? "border-amber/35 bg-gradient-to-br from-amber/[0.08] to-transparent shadow-[0_0_25px_rgba(245,158,11,0.06)] hover:shadow-[0_0_35px_rgba(245,158,11,0.14)]"
          : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]"
      }`}
    >
      {isFirst && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-shine-sweep absolute -inset-y-2 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-gold/[0.14] to-transparent" />
        </div>
      )}

      <div className="relative flex items-center gap-4">
        <div className="relative shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${
              isFirst ? "ring-2 ring-gold shadow-[0_0_22px_rgba(255,215,0,0.45)]" : "ring-1 ring-white/15"
            }`}
            style={{ backgroundColor: player.avatarColor }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          {isYou && (
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-black">
              You
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {isFirst ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/15 text-gold shadow-[0_0_18px_rgba(255,215,0,0.3)]">
              <CrownIcon className="h-5 w-5" />
            </span>
          ) : (
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-black ${
                isSecond
                  ? "border-white/25 bg-white/10 text-slate-200"
                  : isThird
                  ? "border-amber/40 bg-amber/10 text-amber-500"
                  : "border-white/10 bg-white/[0.05] text-text-secondary"
              }`}
            >
              {isSecond || isThird ? (
                <IconMedal className="h-5 w-5" tone={isSecond ? "silver" : "bronze"} />
              ) : (
                rank + 1
              )}
            </span>
          )}

          <div className="min-w-0">
            <p className={`truncate font-bold ${isFirst ? "text-lg text-gold" : "text-sm text-text-primary"}`}>
              {player.name}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{placeLabel(rank)}</p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className={`font-mono font-black ${isFirst ? "text-3xl text-gold" : "text-xl text-gold/90"}`}>
            {total}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Points</p>
        </div>
      </div>
    </motion.div>
  );
}
