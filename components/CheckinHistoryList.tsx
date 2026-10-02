import { categoryMeta } from "@/lib/categoryStyles";
import type { CheckinDTO } from "@/lib/types";

interface CheckinHistoryListProps {
  checkins: CheckinDTO[];
}

export default function CheckinHistoryList({ checkins }: CheckinHistoryListProps) {
  if (checkins.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/50 text-sm text-slate-500">
        <span className="text-2xl">🗒️</span>
        No check-ins yet — head to the dashboard to get your first one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {checkins.map((checkin) => (
        <div
          key={checkin.id}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">
              {new Date(checkin.periodStart).toLocaleDateString()} –{" "}
              {new Date(checkin.periodEnd).toLocaleDateString()}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              ${checkin.totalSpend.toFixed(2)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-800">{checkin.aiSummary}</p>
          {checkin.topCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {checkin.topCategories.map((c) => {
                const meta = categoryMeta(c);
                return (
                  <span
                    key={c}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badgeBg} ${meta.badgeText}`}
                  >
                    {meta.emoji} {c}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
