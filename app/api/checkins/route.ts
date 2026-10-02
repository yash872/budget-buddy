import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { checkinToDTO, type CheckinDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileName = searchParams.get("profileName")?.trim();

    if (!profileName) {
      return Response.json({ error: "profileName is required" }, { status: 400 });
    }

    const db = await getDb();
    const docs = await db
      .collection<CheckinDoc>("checkins")
      .find({ profileName })
      .sort({ generatedAt: -1 })
      .limit(50)
      .toArray();

    const checkins = docs.map((d) => checkinToDTO(d as CheckinDoc & { _id: ObjectId }));
    return Response.json({ checkins });
  } catch (err) {
    Sentry.captureException(err);
    return Response.json({ error: "Something went wrong loading your history" }, { status: 500 });
  }
}
