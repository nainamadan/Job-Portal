import { useSyncExternalStore } from "react";

// Light / dark theme.
// - Until the user picks one, the site follows the device setting (and updates if it changes).
// - A pick is remembered in this browser under the "theme" key.
// - index.html applies the saved theme before the page draws, so there is no white flash.
// Dark colours live in src/theme-dark.css (keyed off the "dark" class on <html>).

const KEY = "theme";
const listeners = new Set();
const media = typeof window !== "undefined" ? window.matchMedia?.("(prefers-color-scheme: dark)") : null;

const readSaved = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
};

const effectiveTheme = () => readSaved() || (media?.matches ? "dark" : "light");

const apply = (theme, animate) => {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  }
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#020617" : "#ffffff");
  listeners.forEach((l) => l());
};

// Follow the device setting while the user hasn't chosen.
media?.addEventListener?.("change", () => {
  if (!readSaved()) apply(effectiveTheme(), true);
});

export const setTheme = (theme) => {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Storage blocked (private mode): still switch for this visit.
  }
  apply(theme, true);
};

export const toggleTheme = () => setTheme(effectiveTheme() === "dark" ? "light" : "dark");

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const snapshot = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

/** Current theme ("light" | "dark"), re-rendering when it changes. */
export const useTheme = () => useSyncExternalStore(subscribe, snapshot, () => "light");

// Make sure the class matches on first load (index.html normally did this already).
if (typeof document !== "undefined") apply(effectiveTheme(), false);
