function trimUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return trimUrl(configured);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return trimUrl(
      vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")
        ? vercelUrl
        : `https://${vercelUrl}`,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_SITE_URL",
  );
}

export const env = {
  siteUrl: resolveSiteUrl(),
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
