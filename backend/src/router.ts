import type { z } from "@jumpifzero/contracts";
import type { RequestContext } from "./middleware/context.ts";

export type RouteModule = {
  readonly schema: {
    readonly params?: z.ZodType<unknown>;
    readonly query?: z.ZodType<unknown>;
    readonly body?: z.ZodType<unknown>;
    readonly output: z.ZodType<unknown>;
  };
  readonly default: (input: {
    readonly ctx: RequestContext;
    readonly params: Record<string, string>;
    readonly query: unknown;
    readonly body: unknown;
  }) => Promise<unknown>;
};

export type CompiledRoute = {
  readonly method: string;
  readonly segments: readonly (
    | { readonly type: "lit"; readonly value: string }
    | { readonly type: "param"; readonly name: string }
  )[];
  readonly routeKey: string;
  readonly module: RouteModule;
};

export type RouteMatch = {
  readonly route: CompiledRoute;
  readonly params: Record<string, string>;
};

const METHOD_FILES = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
]);

export function compileRoute(
  method: string,
  pathPattern: string,
  routeKey: string,
  module: RouteModule,
): CompiledRoute {
  const trimmed = pathPattern.replace(/^\/+|\/+$/g, "");
  const parts = trimmed.length === 0 ? [] : trimmed.split("/");
  const segments = parts.map((part) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      return {
        type: "param" as const,
        name: part.slice(1, -1),
      };
    }
    return { type: "lit" as const, value: part };
  });

  return {
    method: method.toUpperCase(),
    segments,
    routeKey,
    module,
  };
}

export function matchRoute(
  routes: readonly CompiledRoute[],
  method: string,
  pathname: string,
):
  | { readonly type: "match"; readonly match: RouteMatch }
  | { readonly type: "not_found" }
  | { readonly type: "method_not_allowed"; readonly allow: readonly string[] } {
  const path = pathname.replace(/\/+$/, "") || "/";
  const parts =
    path === "/"
      ? []
      : path.replace(/^\//, "").split("/").filter((p) => p.length > 0);

  const methodUpper = method.toUpperCase();
  const allow = new Set<string>();
  let matchedWrongMethod = false;

  for (const route of routes) {
    if (route.segments.length !== parts.length) {
      continue;
    }

    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < route.segments.length; i += 1) {
      const segment = route.segments[i];
      const value = parts[i];
      if (segment === undefined || value === undefined) {
        ok = false;
        break;
      }
      if (segment.type === "lit") {
        if (segment.value !== value) {
          ok = false;
          break;
        }
      } else {
        params[segment.name] = decodeURIComponent(value);
      }
    }

    if (!ok) {
      continue;
    }

    allow.add(route.method);
    if (route.method === methodUpper) {
      return {
        type: "match",
        match: { route, params },
      };
    }
    matchedWrongMethod = true;
  }

  if (matchedWrongMethod) {
    return {
      type: "method_not_allowed",
      allow: [...allow].sort(),
    };
  }

  return { type: "not_found" };
}

export function assertMethodFile(name: string): string {
  if (!METHOD_FILES.has(name)) {
    throw new Error(`invalid route method file: ${name}`);
  }
  return name.toUpperCase();
}
