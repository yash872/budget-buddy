"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [profileName, setProfileName] = useState<string | null>(null);
  const [knownProfiles, setKnownProfiles] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from an external system (localStorage) on mount — not
    // derived from props/state, so there's no render-time alternative here.
    const stored = window.localStorage.getItem(ACTIVE_KEY);
    let recents = readRecents();
    // Migration for people who used the app before `knownProfiles` existed:
    // if there's an active profile but it's missing from the recents list,
    // backfill it so the switcher isn't empty on their next visit.
    if (stored && !recents.some((n) => n.toLowerCase() === stored.toLowerCase())) {
      recents = pushToFront(recents, stored);
      writeRecents(recents);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial hydration from localStorage, the whole point of this effect
    setProfileName(stored);
    setKnownProfiles(recents);
    setHydrated(true);

    // Best-effort: pull the profiles that actually have data on this deployed
    // instance (seeded demo profiles + anyone else who's used it) and merge
    // them in, so a fresh browser still sees them in the switcher instead of a
    // blank name-entry screen. Purely additive — hydration above does NOT wait
    // on this, so the app stays fully usable if the fetch fails or is slow.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profiles");
        if (!res.ok) return;
        const data = (await res.json()) as { profiles?: unknown };
        if (cancelled || !Array.isArray(data.profiles)) return;
        const fromDb = data.profiles.filter((n): n is string => typeof n === "string");
        setKnownProfiles((current) => mergeNames(current, fromDb));
      } catch {
        // Discovery is a nice-to-have; localStorage recents still work offline.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Switches to (or creates) a friend profile and remembers it for next time. */
  const selectProfile = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = pushToFront(readRecents(), trimmed);
    writeRecents(next);
    window.localStorage.setItem(ACTIVE_KEY, trimmed);
    setKnownProfiles(next);
    setProfileName(trimmed);
  }, []);

  /** Leaves the current profile without forgetting it from the switcher. */
  const clearProfile = useCallback(() => {
    window.localStorage.removeItem(ACTIVE_KEY);
    setProfileName(null);
  }, []);

  /** Removes a name from the quick-switch list (doesn't touch their data). */
  const forgetProfile = useCallback(
    (name: string) => {
      const next = readRecents().filter((n) => n.toLowerCase() !== name.toLowerCase());
      writeRecents(next);
      setKnownProfiles(next);
      if (profileName && profileName.toLowerCase() === name.toLowerCase()) {
        window.localStorage.removeItem(ACTIVE_KEY);
        setProfileName(null);
      }
    },
    [profileName]
  );

  return {
    profileName,
    knownProfiles,
    hydrated,
    setProfile: selectProfile,
    selectProfile,
    clearProfile,
    forgetProfile,
  };
}
