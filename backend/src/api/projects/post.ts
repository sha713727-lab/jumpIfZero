import {
  projectCreateSchema,
  projectPublicSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as projectsService from "../../services/projects.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  body: projectCreateSchema,
  output: projectPublicSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  return projectsService.createProject(requireActor(input.ctx), input.body);
}
