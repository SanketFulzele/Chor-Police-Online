import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "gold" | "gold-gradient" | "outline-gold" | "royal-glow";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const variantClasses = {
  primary:
    "bg-royal hover:bg-royal-light text-white border-royal",
  secondary:
    "glass glass-hover text-text-primary border-border",
  ghost:
    "bg-transparent hover:bg-white/5 text-text-secondary border-transparent",
  gold:
    "bg-gold hover:bg-gold-light text-black font-bold border-gold shadow-lg shadow-gold/20",
  "gold-gradient":
    "bg-gradient-to-b from-gold-light via-gold to-gold-dark text-black font-bold border-gold shadow-[0_10px_40px_rgba(255,215,0,0.35)] hover:shadow-[0_14px_50px_rgba(255,215,0,0.5)]",
  "outline-gold":
    "bg-[#0d0d24]/80 hover:bg-gold/10 text-text-primary border-gold/40 hover:border-gold/70 shadow-[0_0_18px_rgba(255,215,0,0.05)] hover:shadow-[0_0_30px_rgba(255,215,0,0.18)]",
  "royal-glow":
    "bg-royal/20 hover:bg-royal/40 text-royal-light border-royal/50 hover:border-royal/80 shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  type = "button",
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        rounded-xl font-semibold cursor-pointer
        border transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
