import { query } from "../db/query.ts";

export async function consumeRateLimitToken(input: {
  readonly bucketKey: string;
  readonly capacity: number;
  readonly refillPerSecond: number;
  readonly cost?: number;
}): Promise<{ readonly allowed: boolean }> {
  const cost = input.cost ?? 1;

  const result = await query(
    `
      INSERT INTO rate_limit_buckets AS b (bucket_key, tokens, last_refill_at)
      VALUES ($1, $2::numeric - $4::numeric, now())
      ON CONFLICT (bucket_key) DO UPDATE
      SET
        tokens = LEAST(
          $2::numeric,
          b.tokens + (
            EXTRACT(EPOCH FROM (now() - b.last_refill_at)) * $3::numeric
          )
        ) - $4::numeric,
        last_refill_at = now(),
        updated_at = now()
      WHERE LEAST(
        $2::numeric,
        b.tokens + (
          EXTRACT(EPOCH FROM (now() - b.last_refill_at)) * $3::numeric
        )
      ) >= $4::numeric
      RETURNING tokens
    `,
    [input.bucketKey, input.capacity, input.refillPerSecond, cost],
  );

  return { allowed: result.rows.length > 0 };
}

export async function deleteStaleRateLimitBuckets(
  olderThanHours = 168,
  limit = 500,
): Promise<number> {
  const result = await query(
    `
      DELETE FROM rate_limit_buckets
      WHERE bucket_key IN (
        SELECT bucket_key
        FROM rate_limit_buckets
        WHERE last_refill_at < now() - make_interval(hours => $1)
        ORDER BY last_refill_at ASC
        LIMIT $2
      )
    `,
    [olderThanHours, limit],
  );
  return result.rowCount ?? 0;
}
