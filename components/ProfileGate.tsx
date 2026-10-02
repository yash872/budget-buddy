"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useProfile } from "@/lib/useProfile";
import Logo from "./Logo";

interface ProfileGateProps {
  children: (profileName: string) => ReactNode;
}

/**
 * Wraps a page so it only renders once we know the friend's name — either
 * from localStorage or freshly entered here. No auth, just a lightweight
 * partition key for a hackathon demo.
 */
export default function ProfileGate({ children }: ProfileGateProps) {
  const { profileName, knownProfiles, hydrated, setProfile } = useProfile();
  const [input, setInput] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-emerald-200" />
      </div>
    );
  }

  if (!profileName) {
    const hasRecents = knownProfiles.length > 0;

    function handleSubmit(e: FormEvent) {
      e.preventDefault();
      setProfile(input);
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/5">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo size={48} />
            <h1 className="text-xl font-semibold text-slate-900">Welcome to Budget Buddy</h1>
            <p className="text-sm text-slate-500">
              {hasRecents
                ? "Pick up where you left off, or add a new friend."
                : "What should we call you? This just helps us keep your spending separate from anyone else using this app."}
            </p>
          </div>

          {hasRecents && !showNewForm && (
            <div className="flex flex-col gap-2">
              {knownProfiles.map((name) => (
                <button
                  key={name}
                  onClick={() => setProfile(name)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  {name}
                </button>
              ))}
              <button
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-left text-sm font-medium text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs">
                  +
                </span>
                Add a new friend
              </button>
            </div>
          )}

          {(!hasRecents || showNewForm) && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Your name
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. Jamie"
                  autoFocus
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>
              <div className="flex gap-2">
                {hasRecents && (
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:shadow-none"
                >
                  Let&apos;s go →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children(profileName)}</>;
}
