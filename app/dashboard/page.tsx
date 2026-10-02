"use client";

import { useCallback, useEffect, useState } from "react";
import ProfileGate from "@/components/ProfileGate";
import SpendingChart from "@/components/SpendingChart";
import CheckinCard from "@/components/CheckinCard";
import { sumAmounts } from "@/lib/aggregate";
import type { CheckinDTO, ExpenseDTO } from "@/lib/types";

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
        {emoji}
      </span>
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function DashboardContent({ profileName }: { profileName: string }) {
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [checkin, setCheckin] = useState<CheckinDTO | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  // Captured once via a lazy initializer rather than calling Date.now()
  // directly in the render body, which the React compiler's purity rule
  // flags as an impure call that could produce unstable render output.
  const [weekCutoff] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);

  const loadExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const res = await fetch(
        `/api/expenses?profileName=${encodeURIComponent(profileName)}&limit=200`
      );
      const data = await res.json();
      if (res.ok) {
        setExpenses(data.expenses ?? []);
      }
    } finally {
      setLoadingExpenses(false);
    }
  }, [profileName]);

  useEffect(() => {
    // Kick off the initial fetch from the server on mount — an external
    // data sync, not a value derived from existing render state.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loadExpenses sets state as part of fetching, which is the point of this effect
    loadExpenses();
  }, [loadExpenses]);

  async function handleCheckin() {
    setCheckinLoading(true);
    setCheckinError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileName, days: 7 }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong");
      }
      setCheckin(data.checkin);
    } catch (err) {
      setCheckinError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCheckinLoading(false);
    }
  }

  const total = sumAmounts(expenses);
  const last7Days = expenses.filter((e) => new Date(e.date).getTime() >= weekCutoff);
  const weekTotal = sumAmounts(last7Days);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your dashboard</h1>
        <p className="text-slate-600">A look at your recent spending, and your weekly coach.</p>
      </div>

      {loadingExpenses ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total logged" value={`$${total.toFixed(2)}`} emoji="💰" />
          <StatCard label="Last 7 days" value={`$${weekTotal.toFixed(2)}`} emoji="📅" />
          <StatCard
            label="Entries"
            value={String(expenses.length)}
            emoji="🧾"
          />
        </div>
      )}

      {loadingExpenses ? (
        <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
      ) : (
        <SpendingChart expenses={expenses} />
      )}

      <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-5">
        <div>
          <p className="font-semibold text-slate-900">Ready for your weekly check-in?</p>
          <p className="text-sm text-slate-500">
            Budget Buddy will look at the last 7 days and give you a warm, judgment-free summary.
          </p>
        </div>
        <button
          onClick={handleCheckin}
          disabled={checkinLoading}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:shadow-none"
        >
          {checkinLoading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Thinking…
            </>
          ) : (
            <>✨ Get my weekly check-in</>
          )}
        </button>
      </div>

      {checkinError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{checkinError}</p>
      )}

      {checkin && <CheckinCard checkin={checkin} />}
    </div>
  );
}

export default function DashboardPage() {
  return <ProfileGate>{(profileName) => <DashboardContent profileName={profileName} />}</ProfileGate>;
}
