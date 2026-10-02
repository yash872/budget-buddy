"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { CATEGORIES, type Category } from "@/lib/categories";
import { categoryMeta } from "@/lib/categoryStyles";
import type { ExpenseDTO } from "@/lib/types";

interface EntryFormProps {
  profileName: string;
  onSaved?: (expense: ExpenseDTO) => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EntryForm({ profileName, onSaved }: EntryFormProps) {
  const [category, setCategory] = useState<Category>("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileName, category, amount, date, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong");
      }
      setAmount("");
      setNote("");
      setSuccess(true);
      onSaved?.(data.expense as ExpenseDTO);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Log a spend</h2>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const meta = categoryMeta(c);
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={clsx(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                active
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : `border-slate-200 ${meta.badgeBg} ${meta.badgeText} hover:border-slate-300`
              )}
            >
              <span>{meta.emoji}</span>
              {c}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Amount
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              $
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="12.50"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-7 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2">
          Note (optional)
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="coffee with a friend"
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          Saved! 🎉
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={clsx(
          "rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
          submitting
            ? "bg-emerald-300 shadow-none"
            : "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700"
        )}
      >
        {submitting ? "Saving…" : "Add expense"}
      </button>
    </form>
  );
}
