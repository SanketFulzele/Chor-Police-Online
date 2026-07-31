import { motion } from "framer-motion";
import { Button } from "../../ui/Button";
import { CrownIcon } from "../../ui/CrownIcon";
import type { RoundHistoryEntry } from "../../../../shared/socket/types";
import { RankingList } from "./RankingList";
import { ScoreTable } from "./ScoreTable";
import { SectionHeader } from "./SectionHeader";
import { PlayerStatCard } from "./PlayerStatCard";
import { AchievementBadge } from "./AchievementBadge";
import type { Achievement } from "./AchievementBadge";
import { SummaryCard } from "./SummaryCard";
import type { SummaryItem } from "./SummaryCard";
import { useCountUp } from "./CountUp";
import { rankPlayers, toRows, toStats } from "./types";
import type { RankedPlayer, RoundRow, StatsShape } from "./types";
import {
  IconCheck,
  IconEyeSlash,
  IconHistory,
  IconHome,
  IconMedal,
  IconSearch,
  IconShield,
  IconSparkle,
  IconTrophy,
} from "./icons";
import type { Room } from "../../../../shared/socket/types";

interface VictoryScreenProps {
  room: Room;
  playerId: string | null;
  winnerId: string;
  winnerName: string;
  playerStatistics: Record<string, unknown> | null;
  roundHistory: RoundHistoryEntry[];
  currentTotals: Record<string, number> | null;
  onBackHome: () => void;
  onGameHistory: () => void;
}

const WINNER_PARTICLES = [
  { top: "-12%", left: "-16%", delay: 0, duration: 4 },
  { top: "-26%", left: "22%", delay: 0.7, duration: 5 },
  { top: "-8%", left: "86%", delay: 1.2, duration: 4.5 },
  { top: "30%", left: "-22%", delay: 1.7, duration: 5.5 },
  { top: "36%", left: "106%", delay: 0.4, duration: 4.8 },
  { top: "74%", left: "-10%", delay: 2.1, duration: 5.2 },
  { top: "80%", left: "94%", delay: 1, duration: 4.2 },
];

interface WinnerShowcaseProps {
  name: string;
  avatarColor: string;
  score: number;
  isYou: boolean;
}

function WinnerShowcase({ name, avatarColor, score, isYou }: WinnerShowcaseProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.7, type: "spring", bounce: 0.35 }}
      className="relative py-4 text-center"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,rgba(255,215,0,0.12),transparent_30deg,rgba(255,215,0,0.12)_60deg,transparent_90deg,rgba(255,215,0,0.12)_120deg,transparent_150deg,rgba(255,215,0,0.12)_180deg,transparent_210deg,rgba(255,215,0,0.12)_240deg,transparent_270deg,rgba(255,215,0,0.12)_300deg,transparent_330deg,rgba(255,215,0,0.12))] opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-glow-pulse rounded-full bg-gold/[0.18] blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ y: -26, opacity: 0, rotate: -12 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 260, damping: 18 }}
          className="mb-3"
        >
          <CrownIcon className="h-12 w-12 animate-float text-gold drop-shadow-[0_0_18px_rgba(255,215,0,0.9)]" />
        </motion.div>

        <div className="relative">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gold shadow-[0_0_45px_rgba(255,215,0,0.4)] ring-4 ring-gold/25">
            <div
              className="flex h-full w-full items-center justify-center text-5xl font-black text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div
              aria-hidden="true"
              className="animate-shine-sweep absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
          </div>

          {WINNER_PARTICLES.map((pt, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute h-2 w-2 animate-float rounded-full bg-gold/70 shadow-[0_0_10px_rgba(255,215,0,0.9)]"
              style={{ top: pt.top, left: pt.left, animationDelay: `${pt.delay}s`, animationDuration: `${pt.duration}s` }}
            />
          ))}

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 15 }}
            className="absolute -bottom-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light px-4 py-1 text-xs font-black uppercase tracking-widest text-black shadow-[0_6px_25px_rgba(255,215,0,0.5)]"
          >
            <IconTrophy className="h-3.5 w-3.5" /> Champion
          </motion.span>
        </div>

        <p className="mt-7 text-3xl font-black tracking-wide gold-gradient text-glow sm:text-4xl">{name}</p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.4em] text-gold/70">Final Score</p>
        <p className="mt-1 font-mono text-5xl font-black text-gold drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">{score}</p>
        {isYou && <p className="mt-2 text-xs font-semibold text-text-secondary">That's you — the realm salutes you!</p>}
      </div>
    </motion.div>
  );
}

interface AchievementCtx {
  topScorers: Set<string>;
  maxRaja: number;
  maxCorrect: number;
  maxHighest: number;
}

function buildAchievements(playerId: string, stats: StatsShape, rows: RoundRow[], ctx: AchievementCtx): Achievement[] {
  const badges: Achievement[] = [];
  const totalRounds = rows.length;

  if (ctx.topScorers.has(playerId)) {
    badges.push({
      id: "champion",
      title: "Champion",
      description: "Finished at the top of the kingdom",
      icon: <IconTrophy className="h-4 w-4" />,
      accent: "border-gold/40 bg-gold/15 text-gold",
    });
  }
  if (stats.correctGuesses > 0 && stats.wrongGuesses === 0) {
    badges.push({
      id: "perfect-detective",
      title: "Perfect Detective",
      description: "Never missed a single Chor",
      icon: <IconSearch className="h-4 w-4" />,
      accent: "border-royal/40 bg-royal/15 text-royal-light",
    });
  }
  if (totalRounds > 0 && stats.timesSipahi === totalRounds) {
    badges.push({
      id: "loyal-sipahi",
      title: "Loyal Sipahi",
      description: `Stood guard as Sipahi in all ${totalRounds} rounds`,
      icon: <IconShield className="h-4 w-4" />,
      accent: "border-amber/40 bg-amber/15 text-amber",
    });
  }
  if (stats.timesRaja > 0 && stats.timesRaja === ctx.maxRaja) {
    badges.push({
      id: "royal-leader",
      title: "Royal Leader",
      description: "Reigned as Raja more than anyone else",
      icon: <CrownIcon className="h-4 w-4" />,
      accent: "border-gold/40 bg-gold/15 text-gold",
    });
  }
  const evaded = rows.filter((r) => r.roles[playerId] === "chor" && !r.isCorrect).length;
  if (evaded > 0) {
    badges.push({
      id: "master-chor",
      title: "Master Chor",
      description: `Escaped the Mantri ${evaded} time${evaded === 1 ? "" : "s"}`,
      icon: <IconEyeSlash className="h-4 w-4" />,
      accent: "border-rose/40 bg-rose/15 text-rose-400",
    });
  }
  if (stats.highestScore > 0 && stats.highestScore === ctx.maxHighest) {
    badges.push({
      id: "highest-score",
      title: "Highest Score",
      description: "Recorded the biggest single-round haul",
      icon: <IconSparkle className="h-4 w-4" />,
      accent: "border-emerald/40 bg-emerald/15 text-emerald",
    });
  }
  if (stats.correctGuesses > 0 && stats.correctGuesses === ctx.maxCorrect) {
    badges.push({
      id: "mvp",
      title: "MVP",
      description: "Most correct identifications of the Chor",
      icon: <IconTrophy className="h-4 w-4" />,
      accent: "border-gold/40 bg-gold/15 text-gold",
    });
  }
  return badges;
}

export function VictoryScreen({
  room,
  playerId,
  winnerId,
  winnerName,
  playerStatistics,
  roundHistory,
  currentTotals,
  onBackHome,
  onGameHistory,
}: VictoryScreenProps) {
  const history: RoundHistoryEntry[] = roundHistory.length > 0 ? roundHistory : room.roundHistory;
  const rows = toRows(history);
  const ranked: RankedPlayer[] = rankPlayers(room.players, currentTotals, rows);
  const rankOf = new Map(ranked.map((r, i) => [r.id, i]));

  const topScore = ranked[0]?.total ?? 0;
  const topScorers = new Set(ranked.filter((r) => r.total === topScore).map((r) => r.id));
  const winnerPlayer = room.players.find((p) => p.id === winnerId);
  const winnerAvatar = winnerPlayer?.avatarColor ?? "#7c3aed";
  const winnerScore = ranked.find((r) => r.id === winnerId)?.total ?? winnerPlayer?.totalScore ?? 0;

  const statsMap = new Map<string, StatsShape | null>();
  for (const p of room.players) statsMap.set(p.id, toStats(playerStatistics?.[p.id]));

  const maxRaja = Math.max(0, ...room.players.map((p) => statsMap.get(p.id)?.timesRaja ?? 0));
  const maxCorrect = Math.max(0, ...room.players.map((p) => statsMap.get(p.id)?.correctGuesses ?? 0));
  const maxHighest = Math.max(0, ...room.players.map((p) => statsMap.get(p.id)?.highestScore ?? 0));

  const evadedCount = (pid: string) => rows.filter((r) => r.roles[pid] === "chor" && !r.isCorrect).length;

  const playersWithBadges = room.players
    .map((p) => {
      const stats = statsMap.get(p.id);
      if (!stats) return null;
      const badges = buildAchievements(p.id, stats, rows, { topScorers, maxRaja, maxCorrect, maxHighest });
      return badges.length > 0 ? { player: p, badges } : null;
    })
    .filter((x): x is { player: typeof room.players[number]; badges: Achievement[] } => x !== null);

  const avgScore = ranked.length > 0 ? Math.round(ranked.reduce((sum, r) => sum + r.total, 0) / ranked.length) : 0;
  const totalCorrect = room.players.reduce((sum, p) => sum + (statsMap.get(p.id)?.correctGuesses ?? 0), 0);
  const bestDetective = room.players
    .map((p) => ({ name: p.name, value: statsMap.get(p.id)?.correctGuesses ?? 0 }))
    .sort((a, b) => b.value - a.value)[0];
  const masterChor = room.players
    .map((p) => ({ name: p.name, value: evadedCount(p.id) }))
    .sort((a, b) => b.value - a.value)[0];

  const summaryItems: SummaryItem[] = [
    { label: "Games Played", value: String(history.length), icon: <IconHistory className="h-4 w-4" />, tone: "royal" },
    { label: "Highest Score", value: String(topScore), icon: <IconSparkle className="h-4 w-4" />, tone: "gold" },
    { label: "Winner", value: winnerName, icon: <IconTrophy className="h-4 w-4" />, tone: "gold" },
    {
      label: "Best Detective",
      value: bestDetective && bestDetective.value > 0 ? bestDetective.name : "—",
      icon: <IconSearch className="h-4 w-4" />,
      tone: "royal",
    },
    {
      label: "Master Chor",
      value: masterChor && masterChor.value > 0 ? masterChor.name : "—",
      icon: <IconEyeSlash className="h-4 w-4" />,
      tone: "rose",
    },
    { label: "Average Score", value: String(avgScore), icon: <IconMedal className="h-4 w-4" />, tone: "amber" },
    { label: "Correct Guesses", value: String(totalCorrect), icon: <IconCheck className="h-4 w-4" />, tone: "emerald" },
  ];

  const winnerScoreValue = useCountUp(winnerScore);
  const hasStats = playerStatistics !== null && Object.keys(playerStatistics).length > 0;

  return (
    <div className="space-y-8" style={{ maxHeight: "calc(100vh - 10rem)" }}>
      <div className="space-y-8 overflow-y-auto pr-1">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pt-6 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-24" />
            <IconTrophy className="h-6 w-6 text-gold drop-shadow-[0_0_12px_rgba(255,215,0,0.7)]" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-24" />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.5em] text-gold/80 sm:text-xs">Game Over</p>
          <h2 className="mt-2 text-3xl font-black tracking-wide gold-gradient text-glow sm:text-5xl">KINGDOM CHAMPION</h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-px max-w-24 flex-1 bg-gradient-to-r from-transparent to-gold/50" />
            <CrownIcon className="h-4 w-4 text-gold/80" />
            <span className="h-px max-w-24 flex-1 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-text-secondary">
              Round {history.length}
            </span>
            <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 font-mono font-bold tracking-widest text-gold/90">
              Room {room.code}
            </span>
          </div>
        </motion.div>

        <WinnerShowcase name={winnerName} avatarColor={winnerAvatar} score={winnerScoreValue} isYou={winnerId === playerId} />

        <section aria-label="Final rankings">
          <SectionHeader icon={<IconTrophy className="h-5 w-5" />} title="Final Standings" subtitle="The royal court in order of merit" />
          <RankingList players={ranked} playerId={playerId} />
        </section>

        <section aria-label="Match history">
          <SectionHeader icon={<IconHistory className="h-5 w-5" />} title="Match History" subtitle="Points earned each round" />
          <ScoreTable rows={rows} ranked={ranked} playerId={playerId} />
        </section>

        {hasStats && (
          <section aria-label="Player statistics">
            <SectionHeader icon={<IconSearch className="h-5 w-5" />} title="Player Statistics" subtitle="Roles, guesses and records" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {room.players.map((p) => {
                const stats = statsMap.get(p.id);
                if (!stats) return null;
                return (
                  <PlayerStatCard
                    key={p.id}
                    name={p.name}
                    avatarColor={p.avatarColor}
                    isYou={p.id === playerId}
                    rank={rankOf.get(p.id) ?? 0}
                    stats={stats}
                  />
                );
              })}
            </div>
          </section>
        )}

        {playersWithBadges.length > 0 && (
          <section aria-label="Achievements">
            <SectionHeader icon={<IconSparkle className="h-5 w-5" />} title="Achievements" subtitle="Royal honors earned this game" />
            <div className="space-y-5">
              {playersWithBadges.map(({ player, badges }) => (
                <div key={player.id}>
                  <p className="mb-2.5 flex items-center gap-2 text-sm font-bold text-text-primary">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ring-1 ring-white/15"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                    {player.name}
                    {player.id === playerId && <span className="text-xs font-normal text-gold/70">(You)</span>}
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {badges.map((badge) => (
                      <AchievementBadge key={badge.id} achievement={badge} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section aria-label="Game summary">
          <SectionHeader icon={<IconTrophy className="h-5 w-5" />} title="Game Summary" subtitle="A brief tale of this game" />
          <SummaryCard items={summaryItems} />
        </section>

        <div className="flex flex-wrap items-center justify-center gap-3 pb-4 pt-1">
          <Button variant="outline-gold" onClick={onBackHome}>
            <span className="inline-flex items-center gap-2">
              <IconHome className="h-4 w-4" />
              Back to Home
            </span>
          </Button>
          <Button variant="royal-glow" onClick={onGameHistory}>
            <span className="inline-flex items-center gap-2">
              <IconHistory className="h-4 w-4" />
              Game History
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
