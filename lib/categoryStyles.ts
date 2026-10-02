import type { Category } from "./categories";

export interface CategoryMeta {
  emoji: string;
  /** Hex color used for chart fills/strokes where Tailwind classes don't reach. */
  hex: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
}

/**
 * Shared look-and-feel per spending category, used by the chart, the entry
 * form, the "just added" feed, and the AI check-in badges — one source of
 * truth so a category always reads the same way everywhere in the app.
 */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    emoji: "🍔",
    hex: "#f59e0b",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    dot: "bg-amber-500",
  },
  Rent: {
    emoji: "🏠",
    hex: "#6366f1",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  Entertainment: {
    emoji: "🎬",
    hex: "#ec4899",
    badgeBg: "bg-pink-50",
    badgeText: "text-pink-700",
    dot: "bg-pink-500",
  },
  Shopping: {
    emoji: "🛍️",
    hex: "#8b5cf6",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    dot: "bg-violet-500",
  },
  Subscriptions: {
    emoji: "📺",
    hex: "#06b6d4",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
    dot: "bg-cyan-500",
  },
  Other: {
    emoji: "✨",
    hex: "#10b981",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category as Category] ?? CATEGORY_META.Other;
}
