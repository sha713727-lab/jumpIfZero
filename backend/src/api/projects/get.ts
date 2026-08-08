import {
  projectsListQuerySchema,
  projectsListResponseSchema,
} from "@jumpifzero/contracts";
import type { RequestContext } from "../../middleware/context.ts";
import * as projectsService from "../../services/projects.ts";
import { requireActor } from "../_helpers.ts";

export const schema = {
  query: projectsListQuerySchema,
  output: projectsListResponseSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly query: unknown;
}): Promise<unknown> {
  return projectsService.listProjects(requireActor(input.ctx), input.query);
}
