"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileGate from "@/components/ProfileGate";
import EntryForm from "@/components/EntryForm";
import RecentEntries from "@/components/RecentEntries";
import type { ExpenseDTO } from "@/lib/types";

export default function HomePage() {
  const [recent, setRecent] = useState<ExpenseDTO[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  return (
    <ProfileGate>
      {(profileName) => (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hey {profileName} 🌱</h1>
            <p className="text-slate-600">
              Log what you spent — no judgment, just the facts. When you&apos;re ready, head to
              your{" "}
              <Link href="/dashboard" className="font-medium text-emerald-700 underline">
                dashboard
              </Link>{" "}
              for a friendly weekly check-in.
            </p>
          </div>

          <EntryForm
            profileName={profileName}
            onSaved={(expense) => {
              setRecent((prev) => [expense, ...prev].slice(0, 5));
              setSessionCount((c) => c + 1);
            }}
          />

          <RecentEntries entries={recent} />

          {sessionCount > 0 && (
            <p className="text-sm text-slate-500">
              You&apos;ve logged {sessionCount} {sessionCount === 1 ? "entry" : "entries"} this
              session. Ready for your{" "}
              <Link href="/dashboard" className="font-medium text-emerald-700 underline">
                check-in
              </Link>
              ?
            </p>
          )}
        </div>
      )}
    </ProfileGate>
  );
}
