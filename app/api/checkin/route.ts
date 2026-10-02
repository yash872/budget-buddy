import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getDb } from "@/lib/mongodb";
import { aggregateByCategory, sumAmounts } from "@/lib/aggregate";
import { buildCheckinPrompt, generateCheckin } from "@/lib/gemma";
import { checkinToDTO, type CheckinDoc, type ExpenseDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const profileName = typeof body?.profileName === "string" ? body.profileName.trim() : "";
    const days = Number.isFinite(Number(body?.days)) ? Number(body.days) : 7;

    if (!profileName) {
      return Response.json({ error: "profileName is required" }, { status: 400 });
    }

    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000);

    const db = await getDb();
    const expenseDocs = await db
      .collection<ExpenseDoc>("expenses")
      .find({ profileName, date: { $gte: periodStart, $lte: periodEnd } })
      .sort({ date: -1 })
      .toArray();

    if (expenseDocs.length === 0) {
      return Response.json(
        { error: "Log a few expenses first, then come back for your check-in!" },
        { status: 400 }
      );
    }

    const categoryBreakdown = aggregateByCategory(expenseDocs);
    const totalSpend = sumAmounts(expenseDocs);

    const prompt = buildCheckinPrompt(
      days,
      totalSpend,
      categoryBreakdown,
      expenseDocs.map((e) => ({
        category: e.category,
        amount: e.amount,
        date: e.date,
        note: e.note,
      }))
    );

    const parsed = await Sentry.startSpan(
      { name: "gemma.generateCheckin", op: "ai.generate" },
      () => generateCheckin(prompt)
    );

    const checkinDoc: CheckinDoc = {
      profileName,
      periodStart,
      periodEnd,
      totalSpend,
      categoryBreakdown,
      aiSummary: parsed.aiSummary,
      topCategories: parsed.topCategories,
      tips: parsed.tips,
      model: parsed.model,
      generatedAt: new Date(),
    };

    const result = await db.collection<CheckinDoc>("checkins").insertOne(checkinDoc);

    return Response.json({
      checkin: checkinToDTO({ ...checkinDoc, _id: result.insertedId }),
    });
  } catch (err) {
    Sentry.captureException(err);
    return Response.json(
      { error: "Something went wrong generating your check-in. Please try again." },
      { status: 500 }
    );
  }
}
