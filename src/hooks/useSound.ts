import { useCallback, useState } from "react";

const SOUNDS = {
  flip: { freq: 800, duration: 100 },
  reveal: { freq: 1200, duration: 200 },
  correct: { freq: 1400, duration: 300 },
  wrong: { freq: 300, duration: 300 },
  victory: { freq: 1800, duration: 500 },
} as const;

function playTone(freq: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Audio not available
  }
}

function getInitialMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("chor-police-muted") === "true";
}

export function useSound() {
  const [isMuted, setIsMuted] = useState(getInitialMuted);

  const play = useCallback((sound: keyof typeof SOUNDS) => {
    setIsMuted((muted) => {
      if (muted) return muted;
      const { freq, duration } = SOUNDS[sound];
      playTone(freq, duration);
      return muted;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem("chor-police-muted", String(next));
      return next;
    });
  }, []);

  return { play, isMuted, toggleMute };
}
