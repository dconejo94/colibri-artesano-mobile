/**
 * User-facing display preferences that override system defaults.
 * Currently just the dark-mode override (Settings screen); in-memory only —
 * resets to 'system' on app restart, same as every other client-only store
 * in this app (no AsyncStorage dependency yet).
 */
import { create } from "zustand";

export type ThemeOverride = "system" | "light" | "dark";

interface PreferencesState {
  themeOverride: ThemeOverride;
  setThemeOverride: (value: ThemeOverride) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  themeOverride: "system",
  setThemeOverride: (value) => set({ themeOverride: value }),
}));
