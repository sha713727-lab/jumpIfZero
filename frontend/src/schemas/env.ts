import { z } from "zod";

function trimUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

export const serverEnvSchema = z.object({
  DEMO_ADMIN_EMAIL: z.string().trim().min(1).pipe(z.email()),
  DEMO_ADMIN_PASSWORD: z.string().trim().min(8),
  DEMO_EMPLOYEE_PASSWORD: z.string().trim().min(8),
  DEMO_CUSTOMER_PASSWORD: z.string().trim().min(8),
  SESSION_SECRET: z.string().trim().min(32, {
    error: "SESSION_SECRET must be at least 32 characters",
  }),
  NEXT_PUBLIC_SITE_URL: z.string().trim().optional(),
  VERCEL_URL: z.string().trim().optional(),
  NODE_ENV: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function resolveSiteUrl(input: {
  readonly siteUrl?: string;
  readonly vercelUrl?: string;
  readonly nodeEnv?: string;
}): string {
  if (input.siteUrl) {
    return trimUrl(input.siteUrl);
  }

  if (input.vercelUrl) {
    return trimUrl(
      input.vercelUrl.startsWith("http://") ||
        input.vercelUrl.startsWith("https://")
        ? input.vercelUrl
        : `https://${input.vercelUrl}`,
    );
  }

  if (input.nodeEnv !== "production") {
    return "http://localhost:3000";
  }

  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_SITE_URL",
  );
}
