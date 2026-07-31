import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-black tracking-wide gold-gradient">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-3 h-px bg-gradient-to-r from-gold/50 via-gold/15 to-transparent" />
    </div>
  );
}
