import { logger } from "./logger.ts";

export function audit(input: {
  readonly action: string;
  readonly correlationId: string;
  readonly actorSubjectId: string;
  readonly route: string;
}): void {
  logger.info({
    msg: `audit:${input.action}`,
    correlationId: input.correlationId,
    route: input.route,
    subjectId: input.actorSubjectId,
  });
}
