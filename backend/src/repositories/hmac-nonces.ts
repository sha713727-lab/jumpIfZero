import { query } from "../db/query.ts";

export async function claimHmacNonce(input: {
  readonly nonce: string;
  readonly expiresAt: Date;
}): Promise<boolean> {
  const result = await query(
    `
      INSERT INTO hmac_nonces (nonce, expires_at)
      VALUES ($1, $2)
      ON CONFLICT (nonce) DO NOTHING
      RETURNING nonce
    `,
    [input.nonce, input.expiresAt],
  );

  return result.rows.length > 0;
}

export async function deleteExpiredHmacNonces(limit = 500): Promise<number> {
  const result = await query(
    `
      DELETE FROM hmac_nonces
      WHERE nonce IN (
        SELECT nonce
        FROM hmac_nonces
        WHERE expires_at < now()
        ORDER BY expires_at ASC
        LIMIT $1
      )
    `,
    [limit],
  );

  return result.rowCount ?? 0;
}
