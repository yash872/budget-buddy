import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  // Keep this on in a hackathon demo so the Gemma call span (see
  // lib/gemma.ts / app/api/checkin/route.ts) actually shows up in Sentry.
  debug: false,
});
