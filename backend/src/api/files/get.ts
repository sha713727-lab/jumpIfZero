import {
  filesListQuerySchema,
  filesListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as filesService from "../../services/files.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: filesListQuerySchema,
  output: filesListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return filesService.listFiles(requireActor(input.ctx), input.query);
}
