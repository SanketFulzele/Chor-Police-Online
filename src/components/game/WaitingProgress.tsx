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
            className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800/60"
          >
            <span className="text-sm font-medium">{p.name}</span>
            <span className="text-xs">
              {hidden ? (
                <span className="text-green-400">Hidden ✓</span>
              ) : revealed ? (
                <span className="text-yellow-400">Revealed</span>
              ) : (
                <span className="text-gray-500">Waiting...</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
