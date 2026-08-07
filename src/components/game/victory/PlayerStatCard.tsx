import { motion } from "framer-motion";
import { ROLE_COLORS, ROLE_LABELS } from "../../../constants/game";
import { ALL_ROLES } from "../../../game/roles";
import type { GameRole } from "../../../types";
import { RoleIcon } from "../RoleIcon";
import { useCountUp } from "./CountUp";
import { IconCheck, IconTrophy, IconX } from "./icons";
import type { StatsShape } from "./types";

interface PlayerStatCardProps {
  name: string;
  avatarColor: string;
  isYou: boolean;
  rank: number;
  stats: StatsShape;
}

const ROLE_KEYS: GameRole[] = ALL_ROLES;

function rankSuffix(i: number): string {
  if (i === 0) return "1st";
  if (i === 1) return "2nd";
  if (i === 2) return "3rd";
  return `${i + 1}th`;
}

export function PlayerStatCard({ name, avatarColor, isYou, rank, stats }: PlayerStatCardProps) {
  const total = useCountUp(stats.totalScore);
  const guesses = stats.correctGuesses + stats.wrongGuesses;
  const accuracy = guesses > 0 ? Math.round((stats.correctGuesses / guesses) * 100) : null;
  const losses = Math.max(0, stats.gamesPlayed - stats.wins);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + rank * 0.06, duration: 0.45, ease: "easeOut" }}
      className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(255,215,0,0.08)]"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ring-1 ring-white/10 transition-shadow duration-300 group-hover:ring-gold/40"
          style={{ backgroundColor: avatarColor }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">
            {name}
            {isYou && <span className="ml-1.5 text-xs font-normal text-gold/70">(You)</span>}
          </p>
          <p className="text-[11px] text-text-muted">{rankSuffix(rank)} · {stats.gamesPlayed} game{stats.gamesPlayed === 1 ? "" : "s"} played</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
        {ROLE_KEYS.map((role) => (
          <div key={role} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5">
            <RoleIcon role={role} className="h-5 w-5" />
            <span className="flex-1 text-[11px] text-text-secondary">{ROLE_LABELS[role]}</span>
            <span className="text-xs font-bold font-mono" style={{ color: ROLE_COLORS[role] }}>
              {String(stats.timesRole[role] ?? 0)}×
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-emerald">
            <IconCheck className="h-3.5 w-3.5" /> Correct
          </span>
          <span className="font-mono font-bold text-emerald-400">{stats.correctGuesses}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-rose">
            <IconX className="h-3.5 w-3.5" /> Wrong
          </span>
          <span className="font-mono font-bold text-rose-400">{stats.wrongGuesses}</span>
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Accuracy</span>
            <span className="font-mono font-bold text-gold/90">{accuracy === null ? "—" : `${accuracy}%`}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-all duration-700"
              style={{ width: accuracy === null ? 0 : `${accuracy}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Points</p>
          <p className="font-mono text-lg font-black text-gold">{total}</p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Wins</p>
            <p className="font-mono text-sm font-bold text-emerald">{stats.wins}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Losses</p>
            <p className="font-mono text-sm font-bold text-rose-400">{losses}</p>
          </div>
          <IconTrophy className="h-4 w-4 text-gold/50" />
        </div>
      </div>
    </motion.div>
  );
}
