import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { HowToPlayModal } from "../components/ui/HowToPlayModal";
import { PremiumBackground } from "../components/layout/PremiumBackground";
import { CARD_IMAGES, ROLE_LABELS, ROLE_COLORS, ROLE_POINTS, ALL_ROLES } from "../constants/game";
import type { GameRole } from "../types";

const ROLES: GameRole[] = ALL_ROLES;

const ROLE_GLOWS: Record<GameRole, string> = {
  raja: "rgba(255, 215, 0, 0.28)",
  police: "rgba(124, 58, 237, 0.34)",
  sipahi: "rgba(245, 158, 11, 0.28)",
  chor: "rgba(239, 68, 68, 0.28)",
  daku: "rgba(236, 72, 153, 0.28)",
  joker: "rgba(34, 211, 238, 0.28)",
  "aam-aadmi": "rgba(148, 163, 184, 0.28)",
  jasoos: "rgba(16, 185, 129, 0.28)",
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function Home() {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <PremiumBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-4xl flex flex-col items-center text-center"
      >
        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <motion.header variants={itemVariants} className="flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-gold/20 to-transparent border border-gold/30 shadow-[0_0_40px_rgba(255,215,0,0.25)] mb-7"
          >
            <span className="text-3xl">👑</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-[0.15em] gold-gradient text-glow leading-none">
            CHOR&nbsp;POLICE
          </h1>

          <div className="flex items-center justify-center gap-3 mt-6 mb-5">
            <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-gold/60" />
            <span className="w-2 h-2 rotate-45 bg-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
            <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-gold/60" />
          </div>

          <p className="text-text-secondary text-base md:text-lg max-w-md mx-auto leading-relaxed">
            The classic Indian strategy game of wit, deception and deduction.
          </p>
          <p className="text-gold/80 text-sm md:text-base tracking-wide mt-2 font-medium">
            Play with friends in real time.
          </p>
        </motion.header>

        {/* ── Action Section ──────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="w-full max-w-md mt-12">
          <div className="relative glass rounded-3xl p-6 sm:p-8 space-y-4 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/create")}
              className="group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-b from-gold-light via-gold to-gold-dark text-black font-bold text-lg tracking-wide shadow-[0_10px_40px_rgba(255,215,0,0.35)] hover:shadow-[0_14px_50px_rgba(255,215,0,0.5)] transition-shadow duration-300 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Room
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/join")}
              className="group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-b from-[#22224a] to-[#0d0d1f] border border-gold/25 text-text-primary font-semibold text-lg tracking-wide hover:border-gold/60 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] transition-all duration-300 cursor-pointer"
            >
              <svg className="w-5 h-5 text-gold/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
              Join Room
            </motion.button>
          </div>

          <p className="text-text-muted text-xs tracking-wide mt-4">
            Real-time matches &middot; 4 to 8 players &middot; No signup needed
          </p>
        </motion.section>

        {/* ── Roles Showcase ──────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="w-full mt-16">
          <div className="mb-8">
            <p className="text-[11px] tracking-[0.35em] uppercase text-gold/70 mb-2">The Eight Roles</p>
            <h2 className="text-2xl md:text-3xl font-bold gold-gradient">Choose Your Destiny</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {ROLES.map((role, i) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div
                  className="absolute -inset-3 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none"
                  style={{ background: ROLE_GLOWS[role] }}
                />
                <div className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-3 sm:p-4 transition-colors duration-300 group-hover:border-gold/30 group-hover:bg-white/[0.04]">
                  <div className="aspect-[1187/1769]">
                    <img
                      src={CARD_IMAGES[role]}
                      alt={ROLE_LABELS[role]}
                      draggable={false}
                      className="w-full h-full object-contain object-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p
                    className="text-center font-bold tracking-[0.15em] uppercase text-sm mt-3"
                    style={{ color: ROLE_COLORS[role] }}
                  >
                    {ROLE_LABELS[role]}
                  </p>
                  <p className="text-center font-mono text-xs font-bold text-gold/80 mt-1">
                    {ROLE_POINTS[role]} pts
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* ── How to Play ───────────────────────────────────────────────── */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHowToPlay(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-gold/40 text-text-muted hover:text-text-primary text-sm font-medium transition-all duration-300 shadow-lg backdrop-blur-md cursor-pointer"
      >
        <svg className="w-5 h-5 text-gold/80" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.832.477 5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span className="hidden sm:inline">How to Play</span>
      </motion.button>

      <HowToPlayModal open={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  );
}
