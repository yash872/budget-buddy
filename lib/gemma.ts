import { GoogleGenAI } from "@google/genai";
import { CATEGORIES } from "./categories";
import type { CategoryBreakdown, MinimalExpenseForPrompt } from "./types";

const MODEL_NAME = process.env.GEMMA_MODEL_NAME || "gemma-4-26b-a4b-it";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_API_KEY is not set. Add it to your .env.local (see .env.local.example)."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export interface ParsedCheckin {
  aiSummary: string;
  topCategories: string[];
  tips: string[];
  model: string;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function buildCheckinPrompt(
  days: number,
  totalSpend: number,
  categoryBreakdown: CategoryBreakdown[],
  recentExpenses: MinimalExpenseForPrompt[]
): string {
  const breakdownLines = categoryBreakdown
    .map((c) => `- ${c.category}: ${formatCurrency(c.total)}`)
    .join("\n");

  const entryLines = recentExpenses
    .slice(0, 20)
    .map((e) => {
      const dateStr = e.date.toISOString().slice(0, 10);
      const noteStr = e.note ? ` (${e.note})` : "";
      return `- ${dateStr} · ${e.category} · ${formatCurrency(e.amount)}${noteStr}`;
    })
    .join("\n");

  return `You are Budget Buddy, a warm, encouraging financial wellness coach. You are talking directly to a friend who is a bit stressed about money. You are never judgmental, never use shame, guilt, or scare tactics, and you never use financial jargon. Speak like a supportive friend, not an advisor.

Here is their spending for the last ${days} days (total: ${formatCurrency(totalSpend)}):
${breakdownLines || "- No spending logged in this window."}

Recent individual entries for context:
${entryLines || "- (none)"}

Respond in exactly this format:

SUMMARY:
<2-3 warm, honest sentences about how the week went. Acknowledge effort, no matter how small. No judgment.>

WATCH:
<1-2 category names from the list above that are worth keeping an eye on, comma separated, with a brief non-shaming reason for each>

TIPS:
1. <concrete, practical, encouraging tip in plain English>
2. <concrete, practical, encouraging tip in plain English>
3. <concrete, practical, encouraging tip in plain English>`;
}

/**
 * Best-effort parse of the SUMMARY:/WATCH:/TIPS: formatted response.
 * If the model doesn't follow the format exactly, we fall back to storing
 * the raw text as the summary rather than letting the whole feature break.
 */
export function parseCheckinResponse(rawText: string, model: string): ParsedCheckin {
  const summaryMatch = rawText.match(/SUMMARY:\s*([\s\S]*?)(?:\n\s*WATCH:|$)/i);
  const watchMatch = rawText.match(/WATCH:\s*([\s\S]*?)(?:\n\s*TIPS:|$)/i);
  const tipsMatch = rawText.match(/TIPS:\s*([\s\S]*)$/i);

  if (!summaryMatch) {
    return {
      aiSummary: rawText.trim(),
      topCategories: [],
      tips: [],
      model,
    };
  }

  // The model doesn't reliably use consistent punctuation between category
  // names and their reasons (commas appear inside reason text too), so
  // instead of splitting on a delimiter we scan for known category names
  // directly — this is robust to whatever formatting the model produces.
  const topCategories = watchMatch
    ? CATEGORIES.filter((cat) =>
        new RegExp(`\\b${cat}\\b`, "i").test(watchMatch[1])
      ).slice(0, 2)
    : [];

  const tips = tipsMatch
    ? tipsMatch[1]
        .split(/\n/)
        .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return {
    aiSummary: summaryMatch[1].trim(),
    topCategories,
    tips,
    model,
  };
}

export async function generateCheckin(prompt: string): Promise<ParsedCheckin> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  const text = response.text ?? "";
  return parseCheckinResponse(text, MODEL_NAME);
}
