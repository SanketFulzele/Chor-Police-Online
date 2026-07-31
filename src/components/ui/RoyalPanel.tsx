import type { ReactNode } from "react";

interface RoyalPanelProps {
  children: ReactNode;
  className?: string;
}

export function RoyalPanel({ children, className = "" }: RoyalPanelProps) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-3xl bg-gradient-to-b from-gold/40 via-gold/10 to-transparent blur-[6px] opacity-70"
      />
      <div
        className={`relative overflow-hidden rounded-3xl bg-surface/90 backdrop-blur-xl border border-gold/30 shadow-[0_30px_80px_rgba(0,0,0,0.65),0_0_50px_rgba(255,215,0,0.07)] ${className}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />
        {children}
      </div>
    </div>
  );
}
