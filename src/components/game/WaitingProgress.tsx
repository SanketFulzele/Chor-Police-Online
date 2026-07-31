import type { Player } from "../../types";

interface WaitingProgressProps {
  players: Player[];
  revealedIds: string[];
  hiddenIds: string[];
}

export function WaitingProgress({ players, revealedIds, hiddenIds }: WaitingProgressProps) {
  return (
    <div className="w-full max-w-sm space-y-2">
      {players.map((p) => {
        const revealed = revealedIds.includes(p.id);
        const hidden = hiddenIds.includes(p.id);
        return (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-white/10"
                style={{ backgroundColor: p.avatarColor }}
              >
                {p.name.charAt(0).toUpperCase()}
              </span>
              {p.name}
            </span>
            <span className="text-xs">
              {hidden ? (
                <span className="text-emerald">Hidden</span>
              ) : revealed ? (
                <span className="text-gold">Revealed</span>
              ) : (
                <span className="text-text-muted">Waiting...</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
