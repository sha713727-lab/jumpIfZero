import type { Middleware } from "./context.ts";

export async function runMiddleware(
  middlewares: readonly Middleware[],
  ctx: Parameters<Middleware>[0],
): Promise<void> {
  for (const middleware of middlewares) {
    await middleware(ctx);
  }
}
