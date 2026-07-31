interface Particle {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
  tone: "gold" | "purple";
}

const PARTICLES: Particle[] = [
  { top: "10%", left: "6%", size: 5, delay: 0, duration: 7, tone: "gold" },
  { top: "22%", left: "14%", size: 3, delay: 1.2, duration: 6, tone: "purple" },
  { top: "8%", left: "78%", size: 4, delay: 0.6, duration: 8, tone: "gold" },
  { top: "18%", left: "90%", size: 3, delay: 2.1, duration: 5.5, tone: "purple" },
  { top: "40%", left: "94%", size: 5, delay: 0.9, duration: 7.5, tone: "gold" },
  { top: "52%", left: "4%", size: 4, delay: 1.8, duration: 6.5, tone: "purple" },
  { top: "66%", left: "11%", size: 3, delay: 0.3, duration: 8, tone: "gold" },
  { top: "76%", left: "90%", size: 4, delay: 2.4, duration: 7, tone: "purple" },
  { top: "84%", left: "80%", size: 3, delay: 1.5, duration: 6, tone: "gold" },
  { top: "30%", left: "46%", size: 3, delay: 3, duration: 9, tone: "purple" },
  { top: "58%", left: "58%", size: 4, delay: 0.4, duration: 6.8, tone: "gold" },
  { top: "88%", left: "28%", size: 3, delay: 2, duration: 7.2, tone: "purple" },
];

const PARTICLE_CLASS: Record<Particle["tone"], string> = {
  gold: "bg-gold/40 shadow-[0_0_8px_rgba(255,215,0,0.5)]",
  purple: "bg-royal/40 shadow-[0_0_8px_rgba(124,58,237,0.5)]",
};

export function PremiumBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1b1640_0%,_#0a0a1a_45%,_#05050c_100%)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[520px] rounded-full bg-gold/[0.08] blur-3xl animate-glow-pulse" />
      <div className="absolute top-1/3 -left-40 w-[520px] h-[520px] rounded-full bg-royal/[0.14] blur-3xl animate-glow-pulse" />
      <div className="absolute -bottom-32 -right-24 w-[500px] h-[500px] rounded-full bg-gold/[0.07] blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute inset-0 vignette" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${PARTICLE_CLASS[p.tone]} animate-float`}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
