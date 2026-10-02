import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isCategory } from "@/lib/categories";
import { expenseToDTO, type ExpenseDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileName = searchParams.get("profileName")?.trim();
    const limitParam = Number(searchParams.get("limit") ?? "100");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 100;

    if (!profileName) {
      return Response.json({ error: "profileName is required" }, { status: 400 });
    }

    const db = await getDb();
    const docs = await db
      .collection<ExpenseDoc>("expenses")
      .find({ profileName })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();

    const expenses = docs.map((d) => expenseToDTO(d as ExpenseDoc & { _id: ObjectId }));
    return Response.json({ expenses });
  } catch (err) {
    Sentry.captureException(err);
    return Response.json({ error: "Something went wrong loading expenses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileName, category, amount, date, note } = body ?? {};

    if (typeof profileName !== "string" || !profileName.trim()) {
      return Response.json({ error: "profileName is required" }, { status: 400 });
    }
    if (!isCategory(category)) {
      return Response.json({ error: "Invalid category" }, { status: 400 });
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: "amount must be a positive number" }, { status: 400 });
    }
    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return Response.json({ error: "Invalid date" }, { status: 400 });
    }

    const doc: ExpenseDoc = {
      profileName: profileName.trim(),
      category,
      amount: parsedAmount,
      date: parsedDate,
      note: typeof note === "string" && note.trim() ? note.trim() : null,
      createdAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection<ExpenseDoc>("expenses").insertOne(doc);

    return Response.json(
      { expense: expenseToDTO({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (err) {
    Sentry.captureException(err);
    return Response.json({ error: "Something went wrong saving your expense" }, { status: 500 });
  }
}
