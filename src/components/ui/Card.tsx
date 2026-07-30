import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        glass rounded-[var(--radius-glass)] p-6
        ${hover ? "glass-hover" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
