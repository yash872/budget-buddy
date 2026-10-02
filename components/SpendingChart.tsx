"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { aggregateByCategory, sumAmounts } from "@/lib/aggregate";
import { categoryMeta } from "@/lib/categoryStyles";
import type { ExpenseDTO } from "@/lib/types";

interface SpendingChartProps {
  expenses: ExpenseDTO[];
}

export default function SpendingChart({ expenses }: SpendingChartProps) {
  const breakdown = aggregateByCategory(expenses);
  const total = sumAmounts(expenses);

  if (breakdown.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/50 text-center text-sm text-slate-500">
        <span className="text-2xl">🌱</span>
        No spending logged yet — add an entry to see your breakdown.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
      <div className="relative mx-auto h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="total"
              nameKey="category"
              innerRadius={62}
              outerRadius={95}
              paddingAngle={3}
              strokeWidth={0}
            >
              {breakdown.map((entry) => (
                <Cell key={entry.category} fill={categoryMeta(entry.category).hex} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(2)}`}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-slate-400">Total</span>
          <span className="text-2xl font-bold text-slate-900">${total.toFixed(0)}</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {breakdown
          .slice()
          .sort((a, b) => b.total - a.total)
          .map((entry) => {
            const meta = categoryMeta(entry.category);
            const pct = total > 0 ? Math.round((entry.total / total) * 100) : 0;
            return (
              <li key={entry.category} className="flex items-center gap-3 text-sm">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                <span className="flex-1 font-medium text-slate-700">
                  {meta.emoji} {entry.category}
                </span>
                <span className="text-slate-400">{pct}%</span>
                <span className="w-16 text-right font-semibold text-slate-900">
                  ${entry.total.toFixed(2)}
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
