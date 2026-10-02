import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps if an auth token is configured (e.g. in CI/Render),
  // so local dev builds don't fail or warn when it's unset.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
