import { filePublicSchema, idParamSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as filesService from "../../../services/files.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  output: filePublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
}): Promise<unknown> {
  return filesService.getFile(
    requireActor(input.ctx),
    input.params.id as string,
  );
}
