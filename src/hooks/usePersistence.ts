import type { StoredGame } from "../types";

const STORAGE_KEY = "chor-police-history";
const MAX_GAMES = 50;

export function usePersistence() {
  function loadHistory(): StoredGame[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as StoredGame[];
    } catch {
      return [];
    }
  }

  function saveGame(game: StoredGame): void {
    try {
      const history = loadHistory();
      history.unshift(game);
      if (history.length > MAX_GAMES) {
        history.length = MAX_GAMES;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Storage full or unavailable
    }
  }

  function clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { loadHistory, saveGame, clearHistory };
}
