import { z } from "@jumpifzero/contracts";
import { InternalError } from "../../../lib/errors.ts";
import {
  assertDatabaseReachable,
  getMigrationStatus,
} from "../../../services/health.ts";

export const schema = {
  output: z.object({
    status: z.literal("ready"),
    applied: z.array(z.string()),
  }),
};

export default async function handle(): Promise<{
  status: "ready";
  applied: string[];
}> {
  try {
    await assertDatabaseReachable();
  } catch {
    throw new InternalError("Database unavailable");
  }

  const status = await getMigrationStatus();
  if (!status.current) {
    throw new InternalError("Migrations pending");
  }
  return {
    status: "ready",
    applied: [...status.applied],
  };
}
