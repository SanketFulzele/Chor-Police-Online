import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-text-secondary mb-2.5 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                error ? "text-rose" : "text-gold/60"
              }`}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-2xl px-4 py-3.5
              bg-white/[0.04] border
              text-text-primary placeholder:text-text-muted
              outline-none
              transition-all duration-300
              focus:bg-white/[0.06]
              ${icon ? "pl-11" : ""}
              ${
                error
                  ? "border-rose focus:border-rose focus:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                  : "border-border focus:border-gold/60 focus:shadow-[0_0_20px_rgba(255,215,0,0.12)]"
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-rose">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
