import { env } from "../config/env.ts";
import { logger } from "./logger.ts";

let started = false;

export async function startOpenTelemetry(): Promise<void> {
  if (!env.OTEL_ENABLED || started) {
    return;
  }
  started = true;

  const [
    { NodeSDK },
    { OTLPTraceExporter },
    { HttpInstrumentation },
    { PgInstrumentation },
    { resourceFromAttributes },
    semconv,
  ] = await Promise.all([
    import("@opentelemetry/sdk-node"),
    import("@opentelemetry/exporter-trace-otlp-http"),
    import("@opentelemetry/instrumentation-http"),
    import("@opentelemetry/instrumentation-pg"),
    import("@opentelemetry/resources"),
    import("@opentelemetry/semantic-conventions"),
  ]);

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [semconv.ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT?.replace(/\/$/, "")}/v1/traces`,
    }),
    instrumentations: [new HttpInstrumentation(), new PgInstrumentation()],
  });

  await sdk.start();
  logger.info({ msg: "opentelemetry started" });

  const shutdown = async () => {
    await sdk.shutdown();
  };
  process.once("SIGTERM", () => {
    void shutdown();
  });
  process.once("SIGINT", () => {
    void shutdown();
  });
}
