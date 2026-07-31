import { z } from "zod";

function trimUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

export const serverEnvSchema = z.object({
  SESSION_SECRET: z.string().trim().min(32, {
    error: "SESSION_SECRET must be at least 32 characters",
  }),
  NEXT_PUBLIC_SITE_URL: z.string().trim().optional(),
  VERCEL_URL: z.string().trim().optional(),
  NODE_ENV: z.string().optional(),
});

export const demoCredentialsSchema = z.object({
  DEMO_ADMIN_EMAIL: z.string().trim().min(1).pipe(z.email()),
  DEMO_ADMIN_PASSWORD: z.string().trim().min(8),
  DEMO_EMPLOYEE_PASSWORD: z.string().trim().min(8),
  DEMO_CUSTOMER_PASSWORD: z.string().trim().min(8),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type DemoCredentials = z.infer<typeof demoCredentialsSchema>;

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

export function readDemoCredentials(): DemoCredentials | null {
  const parsed = demoCredentialsSchema.safeParse({
    DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL,
    DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD,
    DEMO_EMPLOYEE_PASSWORD: process.env.DEMO_EMPLOYEE_PASSWORD,
    DEMO_CUSTOMER_PASSWORD: process.env.DEMO_CUSTOMER_PASSWORD,
  });

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}
