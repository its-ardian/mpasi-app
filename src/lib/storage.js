// Thin localStorage wrapper. Everything in this app is client-only —
// no backend, no accounts — so localStorage is the entire data layer
// beyond the static recipe JSON.

const KEYS = {
  babies: "mpasi.babies",
  activeBabyId: "mpasi.activeBabyId",
  favorites: "mpasi.favorites",
  mealPlan: "mpasi.mealPlan",
  groceryChecked: "mpasi.groceryChecked",
  trackerEntries: "mpasi.trackerEntries",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable (private browsing) — fail silently,
    // the app still works for the current session
  }
}

export const storage = { KEYS, read, write };
