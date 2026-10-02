"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const ACTIVE_KEY = "budgetbuddy_profile";
const RECENTS_KEY = "budgetbuddy_known_profiles";
const MAX_RECENTS = 6;

function readRecents(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeRecents(names: string[]) {
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(names));
}

/** Moves `name` to the front of the list, de-duping case-insensitively. */
function pushToFront(list: string[], name: string): string[] {
  const withoutDupes = list.filter((n) => n.toLowerCase() !== name.toLowerCase());
  return [name, ...withoutDupes].slice(0, MAX_RECENTS);
}

/** Appends names not already present (case-insensitive), preserving order. */
function mergeNames(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((n) => n.toLowerCase()));
  const merged = [...existing];
  for (const name of incoming) {
    if (typeof name === "string" && name.trim() && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      merged.push(name.trim());
    }
  }
  return merged;
}

interface ProfileState {
  profileName: string | null;
  knownProfiles: string[];
  hydrated: boolean;
}

// ---------------------------------------------------------------------------
// Shared module-level store.
//
// `useProfile()` is called from more than one place at once (the page content
// via ProfileGate, and the switcher via ProfileBadge). If each call kept its
// own React state, switching the active profile in the switcher would update
// only the switcher's copy — the page content would keep rendering the old
// profile until the next navigation remounted it and re-read localStorage.
// That's the "I have to change tabs for it to refresh" bug.
//
// Instead we keep ONE store here and subscribe every consumer to it with
// useSyncExternalStore, so a profile switch anywhere re-renders everywhere in
// the same tick. localStorage is still the source of truth across reloads;
// this store is the in-memory mirror that React can actually react to.
// ---------------------------------------------------------------------------
const INITIAL_STATE: ProfileState = {
  profileName: null,
  knownProfiles: [],
  hydrated: false,
};

let state: ProfileState = INITIAL_STATE;
const listeners = new Set<() => void>();

function setState(patch: Partial<ProfileState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ProfileState {
  return state;
}

// Server render (and the first client hydration render) sees the stable
// pre-hydration constant, so client and server markup match. The real
// localStorage-backed values are swapped in by the mount effect below.
function getServerSnapshot(): ProfileState {
  return INITIAL_STATE;
}

let hydrationStarted = false;

/**
 * One-time client hydration from localStorage + best-effort DB discovery.
 * Guarded so that although every mounted consumer calls it, the work runs
 * exactly once; subsequent callers are no-ops that return the already-synced
 * store.
 */
function ensureHydrated() {
  if (hydrationStarted) return;
  hydrationStarted = true;

  const stored = window.localStorage.getItem(ACTIVE_KEY);
  let recents = readRecents();
  // Migration for people who used the app before `knownProfiles` existed:
  // if there's an active profile but it's missing from the recents list,
  // backfill it so the switcher isn't empty on their next visit.
  if (stored && !recents.some((n) => n.toLowerCase() === stored.toLowerCase())) {
    recents = pushToFront(recents, stored);
    writeRecents(recents);
  }
  setState({ profileName: stored, knownProfiles: recents, hydrated: true });

  // Best-effort: pull the profiles that actually have data on this deployed
  // instance (seeded demo profiles + anyone else who's used it) and merge them
  // in, so a fresh browser still sees them in the switcher instead of a blank
  // name-entry screen. Purely additive — hydration above does NOT wait on this,
  // so the app stays fully usable if the fetch fails or is slow.
  (async () => {
    try {
      const res = await fetch("/api/profiles");
      if (!res.ok) return;
      const data = (await res.json()) as { profiles?: unknown };
      if (!Array.isArray(data.profiles)) return;
      const fromDb = data.profiles.filter((n): n is string => typeof n === "string");
      setState({ knownProfiles: mergeNames(state.knownProfiles, fromDb) });
    } catch {
      // Discovery is a nice-to-have; localStorage recents still work offline.
    }
  })();

  // Keep multiple open tabs in sync: if another tab switches or forgets a
  // profile, mirror that change here so this tab doesn't drift.
  window.addEventListener("storage", (e) => {
    if (e.key !== ACTIVE_KEY && e.key !== RECENTS_KEY) return;
    const active = window.localStorage.getItem(ACTIVE_KEY);
    setState({ profileName: active, knownProfiles: readRecents() });
  });
}

/**
 * Lightweight "who's using this" mechanic for a weekend hackathon demo —
 * no auth, just a name saved in localStorage that scopes API calls so
 * multiple friends can use the same deployed app from the same browser.
 *
 * Also remembers every name that's been used on this device (`knownProfiles`)
 * so switching back to a friend you already set up is a single click instead
 * of re-typing their name.
 */
export function useProfile() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // Sync from localStorage once on the first mount (module-guarded inside).
    ensureHydrated();
  }, []);

  /** Switches to (or creates) a friend profile and remembers it for next time. */
  const selectProfile = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = pushToFront(readRecents(), trimmed);
    writeRecents(next);
    window.localStorage.setItem(ACTIVE_KEY, trimmed);
    setState({ knownProfiles: next, profileName: trimmed });
  }, []);

  /** Leaves the current profile without forgetting it from the switcher. */
  const clearProfile = useCallback(() => {
    window.localStorage.removeItem(ACTIVE_KEY);
    setState({ profileName: null });
  }, []);

  /** Removes a name from the quick-switch list (doesn't touch their data). */
  const forgetProfile = useCallback((name: string) => {
    const next = readRecents().filter((n) => n.toLowerCase() !== name.toLowerCase());
    writeRecents(next);
    const clearingActive =
      state.profileName != null && state.profileName.toLowerCase() === name.toLowerCase();
    if (clearingActive) {
      window.localStorage.removeItem(ACTIVE_KEY);
      setState({ knownProfiles: next, profileName: null });
    } else {
      setState({ knownProfiles: next });
    }
  }, []);

  return {
    profileName: snapshot.profileName,
    knownProfiles: snapshot.knownProfiles,
    hydrated: snapshot.hydrated,
    setProfile: selectProfile,
    selectProfile,
    clearProfile,
    forgetProfile,
  };
}
