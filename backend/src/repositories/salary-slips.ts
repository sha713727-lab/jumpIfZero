import {
  salarySlipRowSchema,
  type SalarySlipRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";

const SALARY_SLIP_COLUMNS = `
  id, employee_id, employee_name, designation, slip_date, salary_month,
  basic_salary::text AS basic_salary,
  punctuality::text AS punctuality,
  medical_allowance::text AS medical_allowance,
  incentives::text AS incentives,
  bonus::text AS bonus,
  advance::text AS advance,
  income_tax::text AS income_tax,
  wh_tax::text AS wh_tax,
  fuel_advances::text AS fuel_advances,
  total_earnings::text AS total_earnings,
  total_deduction::text AS total_deduction,
  net_salary::text AS net_salary,
  currency, status_code,
  from_company, from_email, from_phone,
  version, created_at, updated_at, archived_at
`;

export async function getSalarySlipById(
  id: string,
  client?: DbQueryable,
): Promise<SalarySlipRow | null> {
  const result = await query(
    `
      SELECT ${SALARY_SLIP_COLUMNS}
      FROM salary_slips
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(salarySlipRowSchema, row);
}

export async function listSalarySlips(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly employeeId?: string;
  readonly status?: "draft" | "issued";
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "updated_at" | "slip_date" | "salary_month";
  readonly dir: "asc" | "desc";
}): Promise<{ readonly items: readonly SalarySlipRow[]; readonly total: number }> {
  const sortColumn =
    input.sort === "slip_date"
      ? "slip_date"
      : input.sort === "salary_month"
        ? "salary_month"
        : input.sort === "updated_at"
          ? "updated_at"
          : "created_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.archived === "active") {
    where.push("archived_at IS NULL");
  } else if (input.archived === "archived") {
    where.push("archived_at IS NOT NULL");
  }
  if (input.status !== undefined) {
    params.push(input.status);
    where.push(`status_code = $${params.length}`);
  }
  if (input.employeeId !== undefined) {
    params.push(input.employeeId);
    where.push(`employee_id = $${params.length}`);
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(employee_name ILIKE $${params.length} OR designation ILIKE $${params.length} OR salary_month ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const countResult = await query(
    `SELECT count(*)::int AS total FROM salary_slips ${whereSql}`,
    params,
  );
  const total = (countResult.rows[0] as { total: number } | undefined)?.total ?? 0;

  params.push(input.limit);
  const limitParam = params.length;
  params.push(input.offset);
  const offsetParam = params.length;

  const result = await query(
    `
      SELECT ${SALARY_SLIP_COLUMNS}
      FROM salary_slips
      ${whereSql}
      ORDER BY ${sortColumn} ${dir}, id ${dir}
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `,
    params,
  );

  return {
    items: result.rows.map((row) => parseRow(salarySlipRowSchema, row)),
    total,
  };
}

export async function insertSalarySlip(
  input: {
    readonly employeeId: string;
    readonly employeeName: string;
    readonly designation: string;
    readonly slipDate: string;
    readonly salaryMonth: string;
    readonly basicSalary: string;
    readonly punctuality: string;
    readonly medicalAllowance: string;
    readonly incentives: string;
    readonly bonus: string;
    readonly advance: string;
    readonly incomeTax: string;
    readonly whTax: string;
    readonly fuelAdvances: string;
    readonly currency: string;
    readonly statusCode: "draft" | "issued";
    readonly fromCompany: string;
    readonly fromEmail: string;
    readonly fromPhone: string;
  },
  client?: DbQueryable,
): Promise<SalarySlipRow> {
  try {
    const result = await query(
      `
        INSERT INTO salary_slips (
          employee_id, employee_name, designation, slip_date, salary_month,
          basic_salary, punctuality, medical_allowance, incentives, bonus,
          advance, income_tax, wh_tax, fuel_advances,
          currency, status_code, from_company, from_email, from_phone
        )
        VALUES (
          $1, $2, $3, $4::date, $5,
          $6::numeric, $7::numeric, $8::numeric, $9::numeric, $10::numeric,
          $11::numeric, $12::numeric, $13::numeric, $14::numeric,
          $15, $16, $17, $18, $19
        )
        RETURNING id
      `,
      [
        input.employeeId,
        input.employeeName,
        input.designation,
        input.slipDate,
        input.salaryMonth,
        input.basicSalary,
        input.punctuality,
        input.medicalAllowance,
        input.incentives,
        input.bonus,
        input.advance,
        input.incomeTax,
        input.whTax,
        input.fuelAdvances,
        input.currency,
        input.statusCode,
        input.fromCompany,
        input.fromEmail,
        input.fromPhone,
      ],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      throw new InternalError("insertSalarySlip returned no row");
    }
    const row = await getSalarySlipById(id, client);
    if (row === null) {
      throw new InternalError("insertSalarySlip could not reload row");
    }
    return row;
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Salary slip already exists for this employee and month");
    }
    if (isPgCode(err, "23514")) {
      throw new ConflictError("Net salary cannot be negative");
    }
    throw err;
  }
}

export async function updateSalarySlip(
  input: {
    readonly id: string;
    readonly version: number;
    readonly employeeName: string;
    readonly designation: string;
    readonly slipDate: string;
    readonly salaryMonth: string;
    readonly basicSalary: string;
    readonly punctuality: string;
    readonly medicalAllowance: string;
    readonly incentives: string;
    readonly bonus: string;
    readonly advance: string;
    readonly incomeTax: string;
    readonly whTax: string;
    readonly fuelAdvances: string;
    readonly currency: string;
    readonly statusCode: "draft" | "issued";
    readonly fromCompany: string;
    readonly fromEmail: string;
    readonly fromPhone: string;
  },
  client?: DbQueryable,
): Promise<SalarySlipRow | null> {
  try {
    const result = await query(
      `
        UPDATE salary_slips
        SET
          employee_name = $3,
          designation = $4,
          slip_date = $5::date,
          salary_month = $6,
          basic_salary = $7::numeric,
          punctuality = $8::numeric,
          medical_allowance = $9::numeric,
          incentives = $10::numeric,
          bonus = $11::numeric,
          advance = $12::numeric,
          income_tax = $13::numeric,
          wh_tax = $14::numeric,
          fuel_advances = $15::numeric,
          currency = $16,
          status_code = $17,
          from_company = $18,
          from_email = $19,
          from_phone = $20,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND version = $2
          AND archived_at IS NULL
        RETURNING id
      `,
      [
        input.id,
        input.version,
        input.employeeName,
        input.designation,
        input.slipDate,
        input.salaryMonth,
        input.basicSalary,
        input.punctuality,
        input.medicalAllowance,
        input.incentives,
        input.bonus,
        input.advance,
        input.incomeTax,
        input.whTax,
        input.fuelAdvances,
        input.currency,
        input.statusCode,
        input.fromCompany,
        input.fromEmail,
        input.fromPhone,
      ],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      return null;
    }
    return getSalarySlipById(id, client);
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Salary slip already exists for this employee and month");
    }
    if (isPgCode(err, "23514")) {
      throw new ConflictError("Net salary cannot be negative");
    }
    throw err;
  }
}

export async function archiveSalarySlip(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<SalarySlipRow | null> {
  const result = await query(
    `
      UPDATE salary_slips
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
      RETURNING id
    `,
    [input.id, input.version],
    client,
  );
  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }
  return getSalarySlipById(id, client);
}

export async function restoreSalarySlip(
  input: { readonly id: string; readonly version: number },
  client?: DbQueryable,
): Promise<SalarySlipRow | null> {
  try {
    const result = await query(
      `
        UPDATE salary_slips
        SET
          archived_at = NULL,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND version = $2
          AND archived_at IS NOT NULL
        RETURNING id
      `,
      [input.id, input.version],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      return null;
    }
    return getSalarySlipById(id, client);
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("Salary slip already exists for this employee and month");
    }
    throw err;
  }
}
