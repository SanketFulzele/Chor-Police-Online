import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { CrownIcon } from "../ui/CrownIcon";

interface RoundResultPopupProps {
  showResult: { isCorrect: boolean } | null;
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function RoundResultPopup({ showResult }: RoundResultPopupProps) {
  const isCorrect = showResult?.isCorrect ?? false;

  return createPortal(
    <AnimatePresence>
      {showResult && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isCorrect ? "Correct Answer" : "Wrong Answer"}
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4"
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 vignette" />

          <div className="relative w-full max-w-sm my-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className={`relative overflow-hidden rounded-3xl border bg-[#14141f]/95 backdrop-blur-xl ${
                isCorrect
                  ? "border-gold/40 shadow-[0_0_60px_rgba(255,215,0,0.22),0_30px_80px_rgba(0,0,0,0.7)]"
                  : "border-rose/40 shadow-[0_0_60px_rgba(239,68,68,0.2),0_30px_80px_rgba(0,0,0,0.7)]"
              }`}
            >
              {/* Top shine line */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
              />
              {/* Ambient glow */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -top-20 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full blur-3xl ${
                  isCorrect ? "bg-gold/[0.14]" : "bg-rose/[0.14]"
                }`}
              />
              {/* Decorative corners */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 rounded-tl-lg border-gold/40" />
                <div className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 rounded-tr-lg border-gold/40" />
                <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 rounded-bl-lg border-gold/40" />
                <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 rounded-br-lg border-gold/40" />
              </div>

              <div className="relative flex flex-col items-center px-5 py-8 sm:px-8 sm:py-10 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: isCorrect ? -30 : 30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.05 }}
                  className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 ${
                    isCorrect
                      ? "border-gold bg-gradient-to-b from-gold/25 to-transparent shadow-[0_0_45px_rgba(255,215,0,0.45)]"
                      : "border-rose/50 bg-gradient-to-b from-rose/20 to-transparent shadow-[0_0_45px_rgba(239,68,68,0.4)]"
                  }`}
                >
                  {isCorrect ? (
                    <CheckIcon className="h-8 w-8 sm:h-9 sm:w-9 text-gold drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
                  ) : (
                    <XIcon className="h-8 w-8 sm:h-9 sm:w-9 text-rose-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                  )}
                </motion.div>

                {/* Eyebrow */}
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.45em] text-gold/70">
                  Round Result
                </p>

                {/* Title */}
                <h2
                  className={`mt-3 text-2xl sm:text-3xl font-black tracking-[0.14em] ${
                    isCorrect
                      ? "gold-gradient text-glow"
                      : "bg-gradient-to-b from-rose-300 via-rose-400 to-rose-600 bg-clip-text text-transparent"
                  }`}
                >
                  {isCorrect ? "CORRECT!" : "WRONG!"}
                </h2>

                {/* Divider */}
                <div className="my-4 flex w-full items-center justify-center gap-3">
                  <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/40" />
                  <CrownIcon className="h-4 w-4 text-gold/70" />
                  <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/40" />
                </div>

                {/* Message */}
                <p className="max-w-[16rem] text-sm leading-relaxed text-text-secondary sm:max-w-none">
                  {isCorrect
                    ? "The Chor has been caught. Justice prevails in the kingdom!"
                    : "The wrong suspect was chosen. The Chor slips deeper into the shadows..."}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
