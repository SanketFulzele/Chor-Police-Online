import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROLE_COLORS, ROLE_LABELS } from "../../../constants/game";
import type { GameRole } from "../../../types";
import { RoleIcon } from "../RoleIcon";
import { useCountUp } from "./CountUp";
import type { RankedPlayer, RoundRow } from "./types";

interface ScoreTableProps {
  rows: RoundRow[];
  ranked: RankedPlayer[];
  playerId: string | null;
}

interface TooltipState {
  rect: DOMRect;
  role: GameRole;
  round: number;
}

function ScoreTooltip({ cell }: { cell: TooltipState }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="pointer-events-none fixed z-[100]"
      style={{
        left: cell.rect.left + cell.rect.width / 2,
        top: cell.rect.top - 8,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="rounded-lg border border-gold/30 bg-[#1c1c3a] px-3 py-2 text-xs text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] whitespace-nowrap">
        <div className="mb-0.5 text-center text-[10px] font-medium tracking-wide text-white/40">Round {cell.round}</div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1">
            <RoleIcon role={cell.role} />
            <span style={{ color: ROLE_COLORS[cell.role] }} className="font-semibold">
              {ROLE_LABELS[cell.role]}
            </span>
          </span>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

function CountUpCell({ value, className }: { value: number; className?: string }) {
  const display = useCountUp(value);
  return <span className={className}>{display}</span>;
}

export function ScoreTable({ rows, ranked, playerId }: ScoreTableProps) {
  const roundNumbers = [...new Set(rows.map((r) => r.n))].sort((a, b) => a - b);
  const [hoveredCell, setHoveredCell] = useState<TooltipState | null>(null);
  const hoverRef = useRef<{ role: GameRole; round: number } | null>(null);

  const getScore = (playerId: string, n: number) => {
    const rh = rows.find((r) => r.n === n);
    return rh?.scores[playerId] ?? 0;
  };

  const getRole = (playerId: string, n: number): GameRole | undefined => {
    const rh = rows.find((r) => r.n === n);
    return rh?.roles[playerId];
  };

  if (roundNumbers.length === 0) {
    return <p className="text-sm text-text-muted">No rounds completed yet.</p>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[#0d0d24]/85 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "55vh" }}>
        <table className="w-full text-sm" style={{ tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-[72px] py-3.5 pl-4 pr-2 text-left text-[11px] font-bold tracking-widest text-gold/60 uppercase bg-[#15153a] border-b border-gold/25">
                Round
              </th>
              {ranked.map((p, idx) => (
                <th
                  key={p.id}
                  className={`sticky top-0 z-10 py-3.5 px-3 text-right text-[11px] font-bold tracking-widest text-gold/60 uppercase bg-[#15153a] border-b border-gold/25 ${
                    idx > 0 ? "border-l border-white/[0.03]" : ""
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === playerId && <span className="ml-1 text-[10px] font-normal text-gold/40">(You)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roundNumbers.map((rn, i) => (
              <tr
                key={rn}
                className={`${i % 2 === 0 ? "bg-white/[0.015]" : "bg-white/[0.04]"} transition-colors duration-150 hover:bg-gold/[0.06]`}
              >
                <td className="sticky left-0 z-[2] w-[72px] py-2.5 pl-4 pr-2 text-xs font-medium whitespace-nowrap text-gold/50 bg-inherit border-b border-white/[0.03]">
                  Game {rn}
                </td>
                {ranked.map((p, idx) => {
                  const score = getScore(p.id, rn);
                  const role = getRole(p.id, rn);
                  return (
                    <td
                      key={p.id}
                      className={`py-2.5 px-3 text-right font-mono text-sm border-b border-white/[0.03] cursor-default ${
                        idx > 0 ? "border-l border-white/[0.03]" : ""
                      }`}
                      onPointerEnter={(e) => {
                        if (!role) return;
                        hoverRef.current = { role, round: rn };
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setHoveredCell({ rect, role, round: rn });
                      }}
                      onPointerLeave={() => {
                        hoverRef.current = null;
                        setHoveredCell(null);
                      }}
                    >
                      <span className={`select-none ${score > 0 ? "font-semibold text-emerald-400" : "text-white/15"}`}>
                        {score}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="sticky bottom-0 z-10 bg-[#15153a] border-t border-gold/30">
              <td className="py-3.5 pl-4 pr-2 text-[11px] font-bold tracking-widest text-gold uppercase">Total</td>
              {ranked.map((p, idx) => (
                <td
                  key={p.id}
                  className={`py-3.5 px-3 text-right font-mono text-sm font-bold text-gold ${
                    idx > 0 ? "border-l border-white/[0.03]" : ""
                  }`}
                >
                  <CountUpCell value={p.total} />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <AnimatePresence>{hoveredCell && <ScoreTooltip key="tooltip" cell={hoveredCell} />}</AnimatePresence>
    </div>
  );
}
