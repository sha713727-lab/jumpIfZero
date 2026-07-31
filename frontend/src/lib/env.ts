import {
  resolveSiteUrl,
  serverEnvSchema,
} from "@/schemas/env";

const parsed = serverEnvSchema.parse({
  DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD,
  DEMO_EMPLOYEE_PASSWORD: process.env.DEMO_EMPLOYEE_PASSWORD,
  DEMO_CUSTOMER_PASSWORD: process.env.DEMO_CUSTOMER_PASSWORD,
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
