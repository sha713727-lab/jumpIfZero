import { createRequire } from "node:module";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "../config/env.ts";
import { applySecurityHeaders } from "./http.ts";
import { buildOpenApiDocument } from "./openapi.ts";
import type { CompiledRoute } from "../router.ts";

const require = createRequire(import.meta.url);
const swaggerUiRoot = path.dirname(
  require.resolve("swagger-ui-dist/package.json"),
);

const ALLOWED_ASSETS = new Set([
  "swagger-ui.css",
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
  "favicon-32x32.png",
  "favicon-16x16.png",
]);

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

let cachedDocument: Record<string, unknown> | null = null;

function docsEnabled(): boolean {
  return env.NODE_ENV === "development" || env.NODE_ENV === "test";
}

function serverUrl(): string {
  return `http://${env.HOST}:${String(env.PORT)}`;
}

function getOpenApiDocument(
  routes: readonly CompiledRoute[],
): Record<string, unknown> {
  if (cachedDocument === null) {
    cachedDocument = buildOpenApiDocument(routes, serverUrl());
  }
  return cachedDocument;
}

function sendText(
  res: ServerResponse,
  status: number,
  contentType: string,
  body: string | Buffer,
): void {
  applySecurityHeaders(res);
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.end(body);
}

function swaggerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>JumpIfZero API Docs</title>
  <link rel="stylesheet" href="/docs/swagger-ui.css" />
  <link rel="icon" type="image/png" href="/docs/favicon-32x32.png" sizes="32x32" />
  <style>
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/docs/swagger-ui-bundle.js"></script>
  <script src="/docs/swagger-ui-standalone-preset.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: "StandaloneLayout",
      supportedSubmitMethods: [],
      tryItOutEnabled: false
    });
  </script>
</body>
</html>`;
}

function safeAssetPath(assetName: string): string | null {
  if (!ALLOWED_ASSETS.has(assetName)) {
    return null;
  }
  const resolved = path.resolve(swaggerUiRoot, assetName);
  if (!resolved.startsWith(swaggerUiRoot + path.sep)) {
    return null;
  }
  try {
    const stat = statSync(resolved);
    if (!stat.isFile()) {
      return null;
    }
  } catch {
    return null;
  }
  return resolved;
}

export function tryHandleOpenApiDocs(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  routes: readonly CompiledRoute[],
): boolean {
  if (!docsEnabled()) {
    return false;
  }

  const method = (req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return false;
  }

  if (url.pathname === "/openapi.json") {
    const document = getOpenApiDocument(routes);
    const body = JSON.stringify(document);
    sendText(
      res,
      200,
      "application/json; charset=utf-8",
      method === "HEAD" ? "" : body,
    );
    return true;
  }

  if (url.pathname === "/docs" || url.pathname === "/docs/") {
    const body = swaggerHtml();
    sendText(res, 200, "text/html; charset=utf-8", method === "HEAD" ? "" : body);
    return true;
  }

  if (url.pathname.startsWith("/docs/")) {
    const assetName = url.pathname.slice("/docs/".length);
    const assetPath = safeAssetPath(assetName);
    if (assetPath === null) {
      sendText(res, 404, "text/plain; charset=utf-8", "Not found");
      return true;
    }
    const ext = path.extname(assetPath);
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    const body = method === "HEAD" ? Buffer.alloc(0) : readFileSync(assetPath);
    sendText(res, 200, contentType, body);
    return true;
  }

  return false;
}
