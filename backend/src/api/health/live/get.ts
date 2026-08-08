import { z } from "@jumpifzero/contracts";

export const schema = {
  output: z.object({
    status: z.literal("live"),
  }),
};

export default async function handle(): Promise<{ status: "live" }> {
  return { status: "live" };
}
