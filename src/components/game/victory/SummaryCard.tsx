import type { ReactNode } from "react";

export interface SummaryItem {
  label: string;
  value: string;
  icon: ReactNode;
  tone: "gold" | "royal" | "emerald" | "rose" | "amber";
}

const TONE_CLASSES: Record<SummaryItem["tone"], string> = {
  gold: "border-gold/25 bg-gold/[0.06] text-gold",
  royal: "border-royal/25 bg-royal/[0.06] text-royal-light",
  emerald: "border-emerald/25 bg-emerald/[0.06] text-emerald",
  rose: "border-rose/25 bg-rose/[0.06] text-rose-400",
  amber: "border-amber/25 bg-amber/[0.06] text-amber",
};

export function SummaryCard({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 ${TONE_CLASSES[item.tone]}`}
        >
          <div className="flex items-center gap-2">
            {item.icon}
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{item.label}</p>
          </div>
          <p className="mt-2 truncate font-mono text-lg font-black sm:text-xl">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
