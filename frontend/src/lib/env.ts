import {
  resolveSiteUrl,
  serverEnvSchema,
} from "@/schemas/env";

const parsed = serverEnvSchema.parse({
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_URL: process.env.VERCEL_URL,
  NODE_ENV: process.env.NODE_ENV,
});

export const env = {
  siteUrl: resolveSiteUrl({
    ...(parsed.NEXT_PUBLIC_SITE_URL
      ? { siteUrl: parsed.NEXT_PUBLIC_SITE_URL }
      : {}),
    ...(parsed.VERCEL_URL ? { vercelUrl: parsed.VERCEL_URL } : {}),
    ...(parsed.NODE_ENV ? { nodeEnv: parsed.NODE_ENV } : {}),
  }),
  nodeEnv: parsed.NODE_ENV ?? "development",
  sessionSecret: parsed.SESSION_SECRET,
} as const;
