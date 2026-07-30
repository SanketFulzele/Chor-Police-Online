import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl
            glass text-text-primary
            placeholder:text-text-muted
            outline-none
            focus:border-royal focus:border-opacity-50
            transition-colors duration-200
            ${error ? "border-rose" : "border-border"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-rose">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
