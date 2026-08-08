import { z } from "@jumpifzero/contracts";
import type { CompiledRoute } from "../router.ts";

type JsonSchema = Record<string, unknown>;

const ERROR_SCHEMA: JsonSchema = {
  type: "object",
  required: ["ok", "code", "message", "correlationId"],
  additionalProperties: false,
  properties: {
    ok: { type: "boolean", enum: [false] },
    code: {
      type: "string",
      enum: [
        "BAD_REQUEST",
        "UNAUTHORIZED",
        "FORBIDDEN",
        "NOT_FOUND",
        "METHOD_NOT_ALLOWED",
        "CONFLICT",
        "PAYLOAD_TOO_LARGE",
        "VALIDATION_FAILED",
        "RATE_LIMITED",
        "INTERNAL",
      ],
    },
    message: { type: "string" },
    correlationId: { type: "string", format: "uuid" },
    fields: {
      type: "array",
      items: {
        type: "object",
        required: ["path", "message"],
        additionalProperties: false,
        properties: {
          path: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

function openApiPath(route: CompiledRoute): string {
  if (route.segments.length === 0) {
    return "/";
  }
  return `/${route.segments
    .map((segment) =>
      segment.type === "param" ? `{${segment.name}}` : segment.value,
    )
    .join("/")}`;
}

function tagForRouteKey(routeKey: string): string {
  const dot = routeKey.indexOf(".");
  return dot === -1 ? routeKey : routeKey.slice(0, dot);
}

function zodToOpenApiSchema(
  schema: z.ZodType<unknown>,
  io: "input" | "output",
): JsonSchema {
  const raw = z.toJSONSchema(schema, {
    target: "openapi-3.0",
    unrepresentable: "any",
    io,
  }) as JsonSchema;
  const { $schema: _schema, ...rest } = raw;
  return rest;
}

function wrapSuccess(dataSchema: JsonSchema): JsonSchema {
  return {
    type: "object",
    required: ["ok", "data", "correlationId"],
    additionalProperties: false,
    properties: {
      ok: { type: "boolean", enum: [true] },
      data: dataSchema,
      correlationId: { type: "string", format: "uuid" },
    },
  };
}

function errorResponse(description: string): JsonSchema {
  return {
    description,
    content: {
      "application/json": {
        schema: ERROR_SCHEMA,
      },
    },
  };
}

export function buildOpenApiDocument(
  compiledRoutes: readonly CompiledRoute[],
  serverUrl: string,
): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};
  const tags = new Map<string, { name: string }>();

  for (const route of compiledRoutes) {
    const path = openApiPath(route);
    const method = route.method.toLowerCase();
    const tag = tagForRouteKey(route.routeKey);
    tags.set(tag, { name: tag });

    const parameters: JsonSchema[] = [];
    for (const segment of route.segments) {
      if (segment.type !== "param") {
        continue;
      }
      parameters.push({
        name: segment.name,
        in: "path",
        required: true,
        schema: { type: "string" },
      });
    }

    if (route.module.schema.params) {
      try {
        const paramsSchema = zodToOpenApiSchema(
          route.module.schema.params,
          "input",
        );
        const properties =
          typeof paramsSchema.properties === "object" &&
          paramsSchema.properties !== null
            ? (paramsSchema.properties as Record<string, JsonSchema>)
            : {};
        for (const [name, schema] of Object.entries(properties)) {
          const existing = parameters.find(
            (parameter) => parameter.name === name && parameter.in === "path",
          );
          if (existing) {
            existing.schema = schema;
          } else {
            parameters.push({
              name,
              in: "path",
              required: true,
              schema,
            });
          }
        }
      } catch {
        // keep default string path params
      }
    }

    if (route.module.schema.query) {
      try {
        const querySchema = zodToOpenApiSchema(
          route.module.schema.query,
          "input",
        );
        const properties =
          typeof querySchema.properties === "object" &&
          querySchema.properties !== null
            ? (querySchema.properties as Record<string, JsonSchema>)
            : {};
        const required = Array.isArray(querySchema.required)
          ? new Set(querySchema.required as string[])
          : new Set<string>();
        for (const [name, schema] of Object.entries(properties)) {
          parameters.push({
            name,
            in: "query",
            required: required.has(name),
            schema,
          });
        }
      } catch {
        // omit broken query schemas
      }
    }

    const operation: Record<string, unknown> = {
      operationId: route.routeKey,
      tags: [tag],
      summary: route.routeKey,
      security: [{ HmacHeaders: [] }],
      parameters,
      responses: {
        "401": errorResponse("Unauthorized — missing or invalid HMAC"),
        "403": errorResponse("Forbidden"),
        "404": errorResponse("Not found"),
        "422": errorResponse("Validation failed"),
        "429": errorResponse("Rate limited"),
        "500": errorResponse("Internal error"),
      },
    };

    if (route.module.schema.body) {
      try {
        operation.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: zodToOpenApiSchema(route.module.schema.body, "input"),
            },
          },
        };
      } catch {
        operation.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        };
      }
    }

    try {
      const dataSchema = zodToOpenApiSchema(route.module.schema.output, "output");
      const responses = operation.responses as Record<string, unknown>;
      if (method === "delete") {
        responses["204"] = { description: "No content" };
      } else {
        responses["200"] = {
          description: "Success envelope",
          content: {
            "application/json": {
              schema: wrapSuccess(dataSchema),
            },
          },
        };
      }
    } catch {
      const responses = operation.responses as Record<string, unknown>;
      responses["200"] = {
        description: "Success envelope",
        content: {
          "application/json": {
            schema: wrapSuccess({ type: "object", additionalProperties: true }),
          },
        },
      };
    }

    const existing = paths[path] ?? {};
    existing[method] = operation;
    paths[path] = existing;
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "JumpIfZero API",
      version: "0.1.0",
      description: [
        "Private HMAC-gated HTTP API. All business routes require signed `X-JZ-*` headers.",
        "",
        "Success responses use `{ ok: true, data, correlationId }`.",
        "Error responses use `{ ok: false, code, message, correlationId, fields? }`.",
        "",
        "Swagger UI is available only when `NODE_ENV` is `development` or `test`.",
        "Try-it-out is disabled here because requests must be HMAC-signed by the Next.js gateway.",
      ].join("\n"),
    },
    servers: [{ url: serverUrl, description: "Local backend" }],
    tags: [...tags.values()].sort((a, b) => a.name.localeCompare(b.name)),
    paths,
    components: {
      securitySchemes: {
        HmacHeaders: {
          type: "apiKey",
          in: "header",
          name: "X-JZ-Signature",
          description: [
            "HMAC signature (hex SHA-256).",
            "Also send: X-JZ-Key-Id, X-JZ-Timestamp, X-JZ-Nonce,",
            "X-JZ-Subject-Id, X-JZ-Role, and X-JZ-Employee-Kind (or empty).",
          ].join(" "),
        },
      },
      schemas: {
        ErrorEnvelope: ERROR_SCHEMA,
      },
    },
    security: [{ HmacHeaders: [] }],
  };
}
