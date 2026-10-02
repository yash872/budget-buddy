import clsx from "clsx";
import { categoryMeta } from "@/lib/categoryStyles";
import type { ExpenseDTO } from "@/lib/types";

interface RecentEntriesProps {
  entries: ExpenseDTO[];
}

/**
 * Shows the expenses just logged this session, newest first — immediate
 * visual confirmation that "Add expense" actually did something, instead
 * of the form just silently resetting.
 */
export default function RecentEntries({ entries }: RecentEntriesProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-500">Just added</h3>
      <ul className="flex flex-col gap-2">
        {entries.map((entry, i) => {
          const meta = categoryMeta(entry.category);
          return (
            <li key={entry.id} className={clsx(i === 0 && "animate-[fadeIn_0.3s_ease-out]")}>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${meta.badgeBg}`}
                >
                  {meta.emoji}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {entry.category}
                    {entry.note ? (
                      <span className="font-normal text-slate-500"> · {entry.note}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(entry.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${entry.amount.toFixed(2)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
