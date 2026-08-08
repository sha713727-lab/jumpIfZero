import { headers } from "next/headers";
import { env } from "@/lib/env";
import { isSameOriginRequest } from "@/lib/sameOrigin";

export class SameOriginError extends Error {
  constructor() {
    super("same-origin check failed");
    this.name = "SameOriginError";
  }
}

export { isSameOriginRequest, originFromUrl } from "@/lib/sameOrigin";

export async function assertSameOrigin(): Promise<void> {
  const headerStore = await headers();
  const ok = isSameOriginRequest({
    siteUrl: env.siteUrl,
    origin: headerStore.get("origin"),
    referer: headerStore.get("referer"),
  });
  if (!ok) {
    throw new SameOriginError();
  }
}
