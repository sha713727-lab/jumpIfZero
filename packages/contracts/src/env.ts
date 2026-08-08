import { z } from "zod";

function trimUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

const PLACEHOLDER_SECRETS = new Set([
  "changeme",
  "change_me",
  "replace_me",
  "your-secret-here",
  "placeholder",
  "secret",
  "password",
  "00000000000000000000000000000000",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "dev-only-hmac-secret-do-not-use!!",
  "replace-with-jz-app-password-32chars",
]);

function isUniformString(value: string): boolean {
  if (value.length === 0) {
    return true;
  }
  const first = value[0];
  for (let i = 1; i < value.length; i += 1) {
    if (value[i] !== first) {
      return false;
    }
  }
  return true;
}

const secretSchema = z
  .string()
  .trim()
  .min(32)
  .refine((value) => !PLACEHOLDER_SECRETS.has(value.toLowerCase()), {
    message: "secret must not be a placeholder value",
  })
  .refine((value) => !/^replace_?me/i.test(value), {
    message: "secret must not be a placeholder value",
  })
  .refine((value) => !/^change_?me/i.test(value), {
    message: "secret must not be a placeholder value",
  })
  .refine((value) => !isUniformString(value), {
    message: "secret must not be a uniform placeholder",
  });

export const serverEnvSchema = z.object({
  SESSION_SECRET: secretSchema,
  BACKEND_BASE_URL: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.replace(/\/$/, ""))
    .pipe(z.url()),
  HMAC_SECRET: secretSchema,
  HMAC_KEY_ID: z.string().trim().min(1).max(64),
  HMAC_GATEWAY_SUBJECT_ID: z.uuid(),
  NEXT_PUBLIC_SITE_URL: z.string().trim().optional(),
  VERCEL_URL: z.string().trim().optional(),
  NODE_ENV: z.string().optional(),
  SENTRY_DSN: z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  }, z.string().trim().url().optional()),
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
