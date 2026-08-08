import { blogPostCreateSchema, blogPostRowSchema } from "@jumpifzero/contracts";
import type { RequestContext } from "../../../middleware/context.ts";
import * as blogService from "../../../services/blog-posts.ts";
import { requireActor } from "../../_helpers.ts";

export const schema = {
  body: blogPostCreateSchema,
  output: blogPostRowSchema,
};

export default async function handle(input: {
  readonly ctx: RequestContext;
  readonly body: unknown;
}): Promise<unknown> {
  const actor = requireActor(input.ctx);
  return blogService.createBlogPost(
    actor,
    input.body,
    input.ctx.correlationId,
  );
}
