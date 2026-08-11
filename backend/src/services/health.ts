import { listSchemaMigrations } from "../repositories/schema-migrations.ts";

export const EXPECTED_MIGRATIONS = [
  "0001_init",
  "0002_jz_app_select_soft_delete",
  "0003_password_reset_tokens",
  "0004_phase5_cms",
  "0005_site_sections",
  "0006_phase_x_indexes",
  "0007_message_attachments",
  "0008_site_contact",
  "0009_invoice_party_snapshot",
  "0010_invoice_optional_client",
  "0011_user_image_path",
  "0012_salary_slips",
  "0013_public_cms_nap",
  "0014_site_contact_socials",
] as const;

export async function getMigrationStatus(): Promise<{
  readonly current: boolean;
  readonly applied: readonly string[];
  readonly pending: readonly string[];
}> {
  const rows = await listSchemaMigrations();
  const applied = rows.map((row) => row.version);
  const appliedSet = new Set(applied);
  const pending = EXPECTED_MIGRATIONS.filter(
    (version) => !appliedSet.has(version),
  );

  return {
    current: pending.length === 0,
    applied,
    pending,
  };
}
