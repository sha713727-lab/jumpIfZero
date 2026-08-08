import {
  idParamSchema,
  projectArchiveSchema,
  projectPublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../../../middleware/context.ts";
import * as projectsService from "../../../../services/projects.ts";
import { requireActor } from "../../../_helpers.ts";

export const schema = {
  params: idParamSchema,
  body: projectArchiveSchema.omit({ id: true }),
  output: projectPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly params: Record<string, string>;
  readonly body: unknown;
}): Promise<unknown> {
  const body = input.body as Record<string, unknown>;
  return projectsService.archiveProject(requireActor(input.ctx), {
    ...body,
    id: input.params.id,
  });
}
