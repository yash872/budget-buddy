import * as Sentry from "@sentry/nextjs";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * Lists the profile names that actually have spending logged. Used to surface
 * seeded demo profiles (and anyone else who's used this deployed instance) in
 * the welcome screen + friend-switcher, so a fresh visitor isn't stuck on a
 * blank name-entry screen with no way to discover the demo data.
 *
 * This is the one endpoint that enumerates profiles — every other route takes
 * a required `profileName` filter.
 */
export async function GET() {
  try {
    const db = await getDb();
    const names = (await db.collection("expenses").distinct("profileName")) as string[];
    const profiles = names
      .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
    return Response.json({ profiles });
  } catch (err) {
    Sentry.captureException(err);
    return Response.json({ error: "Something went wrong loading profiles" }, { status: 500 });
  }
}
