import { CARD_IMAGES } from "../../constants/game";
import type { GameRole } from "../../types";

interface RoleIconProps {
  role: GameRole;
  className?: string;
}

export function RoleIcon({ role, className = "w-4 h-4" }: RoleIconProps) {
  return (
    <img
      src={CARD_IMAGES[role]}
      alt={role}
      draggable={false}
      className={`inline-block object-contain ${className}`}
    />
  );
}
