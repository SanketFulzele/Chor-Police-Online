import type { ReactNode } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
}

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold/[0.05] px-4 py-3 transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.09] hover:shadow-[0_0_20px_rgba(255,215,0,0.08)]">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-110 ${achievement.accent}`}
      >
        {achievement.icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gold">{achievement.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{achievement.description}</p>
      </div>
    </div>
  );
}
