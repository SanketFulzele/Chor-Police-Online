interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export function IconHome({ className = "w-5 h-5", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
      />
    </svg>
  );
}

export function IconHistory({ className = "w-5 h-5", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5M21 12a9 9 0 1 1-2.636-6.364A9 9 0 0 1 21 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 2.5 2 3h-3.5M15 2.5V6" />
    </svg>
  );
}

export function IconTrophy({ className = "w-5 h-5", strokeWidth = 1.7 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
      />
    </svg>
  );
}

export function IconMedal({ className = "w-5 h-5", tone = "silver" }: { className?: string; tone?: "silver" | "bronze" }) {
  const color = tone === "silver" ? "#e2e8f0" : "#d97706";
  return (
    <span className="inline-flex" style={{ color }}>
      <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l-1.5 6H10.5L9 3Z" />
        <circle cx="12" cy="14" r="5.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m12 12.1.95 1.92 2.12.31-1.53 1.5.36 2.12L12 16.85l-1.9 1.1.36-2.12-1.53-1.5 2.12-.31.95-1.92Z" />
      </svg>
    </span>
  );
}

export function IconCheck({ className = "w-5 h-5", strokeWidth = 2.2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

export function IconX({ className = "w-5 h-5", strokeWidth = 2.2 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export function IconSparkle({ className = "w-5 h-5", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21M5.636 5.636l3.182 3.182M15.182 15.182l3.182 3.182M18.364 5.636l-3.182 3.182M8.818 15.182l-3.182 3.182" />
    </svg>
  );
}

export function IconShield({ className = "w-5 h-5", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}

export function IconSearch({ className = "w-5 h-5", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
    </svg>
  );
}

export function IconEyeSlash({ className = "w-5 h-5", strokeWidth = 1.8 }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 5.584A10.5 10.5 0 0 1 12 5.5c5.25 0 9.75 3.75 12 8.5a14 14 0 0 1-3.2 3.98M6.6 6.6A14.06 14.06 0 0 0 0 14c1.5 3 6 8 12 8a11.5 11.5 0 0 0 4.2-.79" />
    </svg>
  );
}
