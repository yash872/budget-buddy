"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useProfile } from "@/lib/useProfile";

export default function ProfileBadge() {
  const { profileName, knownProfiles, selectProfile, clearProfile, forgetProfile } =
    useProfile();
  const [open, setOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingNew(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!profileName) return null;

  const others = knownProfiles.filter((n) => n.toLowerCase() !== profileName.toLowerCase());

  function handleAddNew(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    selectProfile(newName);
    setNewName("");
    setAddingNew(false);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 text-sm font-medium text-emerald-900 transition hover:from-emerald-200 hover:to-teal-200"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="hidden sm:inline">Hi, {profileName}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Switch friend
          </p>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-2 py-1.5">
            <span className="flex-1 truncate text-sm font-medium text-emerald-900">
              {profileName}
            </span>
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              active
            </span>
          </div>

          {others.length > 0 && (
            <ul className="mt-1 flex flex-col">
              {others.map((name) => (
                <li key={name} className="group flex items-center gap-1">
                  <button
                    onClick={() => {
                      selectProfile(name);
                      setOpen(false);
                    }}
                    className="flex-1 truncate rounded-xl px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {name}
                  </button>
                  <button
                    onClick={() => forgetProfile(name)}
                    aria-label={`Remove ${name} from switcher`}
                    className="rounded-lg px-1.5 py-1 text-xs text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="my-2 border-t border-slate-100" />

          {addingNew ? (
            <form onSubmit={handleAddNew} className="flex items-center gap-1.5 px-1 py-1">
              <input
                type="text"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Friend's name"
                className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-300"
              >
                Add
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs">
                +
              </span>
              Add a new friend
            </button>
          )}

          <button
            onClick={() => {
              clearProfile();
              setOpen(false);
            }}
            className="mt-1 w-full rounded-xl px-2 py-1.5 text-left text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            Sign out of this device
          </button>
        </div>
      )}
    </div>
  );
}
