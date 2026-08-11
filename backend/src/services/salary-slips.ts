import {
  salarySlipArchiveSchema,
  salarySlipCreateSchema,
  salarySlipPublicSchema,
  salarySlipRestoreSchema,
  salarySlipsListQuerySchema,
  salarySlipsListResponseSchema,
  salarySlipUpdateSchema,
  type Actor,
  type SalarySlipPublic,
  type SalarySlipRow,
} from "@jumpifzero/contracts";
import { withTransaction } from "../db/transaction.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as employeesRepo from "../repositories/employees.ts";
import * as idempotencyRepo from "../repositories/idempotency-keys.ts";
import * as salarySlipsRepo from "../repositories/salary-slips.ts";
import { parseInput, resolveVersionWrite } from "./_helpers.ts";
import { requireAdmin } from "./authz.ts";

function dateOnly(value: Date): string {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeMoney(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  return numeric.toFixed(2);
}

function toPublic(row: SalarySlipRow): SalarySlipPublic {
  return salarySlipPublicSchema.parse({
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    designation: row.designation,
    slipDate: dateOnly(row.slip_date),
    salaryMonth: row.salary_month,
    basicSalary: normalizeMoney(row.basic_salary),
    punctuality: normalizeMoney(row.punctuality),
    medicalAllowance: normalizeMoney(row.medical_allowance),
    incentives: normalizeMoney(row.incentives),
    bonus: normalizeMoney(row.bonus),
    advance: normalizeMoney(row.advance),
    incomeTax: normalizeMoney(row.income_tax),
    whTax: normalizeMoney(row.wh_tax),
    fuelAdvances: normalizeMoney(row.fuel_advances),
    totalEarnings: normalizeMoney(row.total_earnings),
    totalDeduction: normalizeMoney(row.total_deduction),
    netSalary: normalizeMoney(row.net_salary),
    currency: row.currency.trim(),
    statusCode: row.status_code,
    fromCompany: row.from_company,
    fromEmail: row.from_email,
    fromPhone: row.from_phone,
    version: row.version,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

export async function listSalarySlips(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  requireAdmin(actor);
  const query = parseInput(salarySlipsListQuerySchema, input);
  const result = await salarySlipsRepo.listSalarySlips({
    limit: query.limit,
    offset: query.offset,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.employeeId !== undefined ? { employeeId: query.employeeId } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
  });
  return salarySlipsListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getSalarySlip(
  actor: Actor,
  id: string,
): Promise<SalarySlipPublic> {
  requireAdmin(actor);
  const row = await salarySlipsRepo.getSalarySlipById(id);
  if (row === null) {
    throw new NotFoundError("Salary slip not found");
  }
  return toPublic(row);
}

export async function createSalarySlip(
  actor: Actor,
  input: unknown,
  opts: {
    readonly idempotencyKey: string;
    readonly method: string;
    readonly path: string;
  },
): Promise<{
  readonly replay: boolean;
  readonly status: number;
  readonly body: SalarySlipPublic;
}> {
  requireAdmin(actor);
  const body = parseInput(salarySlipCreateSchema, input);
  const key = opts.idempotencyKey.trim();

  return withTransaction(async (tx) => {
    const raced = await idempotencyRepo.findActiveIdempotencyKey(
      {
        key,
        method: opts.method,
        path: opts.path,
        subjectId: actor.subjectId,
      },
      tx,
    );
    if (raced !== null) {
      return {
        replay: true,
        status: raced.response_status,
        body: salarySlipPublicSchema.parse(raced.response_body),
      };
    }

    const employee = await employeesRepo.getEmployeeById(body.employeeId, tx);
    if (employee === null || employee.archived_at !== null) {
      throw new NotFoundError("Employee not found");
    }

    const employeeName = employee.user_name ?? "Employee";
    const designation =
      body.designation !== undefined && body.designation.trim().length > 0
        ? body.designation.trim()
        : employee.title;

    const row = await salarySlipsRepo.insertSalarySlip(
      {
        employeeId: body.employeeId,
        employeeName,
        designation,
        slipDate: body.slipDate,
        salaryMonth: body.salaryMonth,
        basicSalary: body.basicSalary,
        punctuality: body.punctuality,
        medicalAllowance: body.medicalAllowance,
        incentives: body.incentives,
        bonus: body.bonus,
        advance: body.advance,
        incomeTax: body.incomeTax,
        whTax: body.whTax,
        fuelAdvances: body.fuelAdvances,
        currency: body.currency,
        statusCode: body.statusCode,
        fromCompany: body.fromCompany,
        fromEmail: body.fromEmail,
        fromPhone: body.fromPhone,
      },
      tx,
    );
    const publicBody = toPublic(row);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const stored = await idempotencyRepo.insertIdempotencyKey(
      {
        key,
        method: opts.method,
        path: opts.path,
        subjectId: actor.subjectId,
        responseStatus: 201,
        responseBody: publicBody,
        expiresAt,
      },
      tx,
    );
    if (stored === null) {
      const again = await idempotencyRepo.findActiveIdempotencyKey(
        {
          key,
          method: opts.method,
          path: opts.path,
          subjectId: actor.subjectId,
        },
        tx,
      );
      if (again !== null) {
        return {
          replay: true,
          status: again.response_status,
          body: salarySlipPublicSchema.parse(again.response_body),
        };
      }
    }
    return {
      replay: false,
      status: 201,
      body: publicBody,
    };
  });
}

export async function updateSalarySlip(
  actor: Actor,
  input: unknown,
): Promise<SalarySlipPublic> {
  requireAdmin(actor);
  const body = parseInput(salarySlipUpdateSchema, input);
  const existing = await salarySlipsRepo.getSalarySlipById(body.id);
  if (existing === null || existing.archived_at !== null) {
    throw new NotFoundError("Salary slip not found");
  }
  const updated = await salarySlipsRepo.updateSalarySlip({
    id: body.id,
    version: body.version,
    employeeName: body.employeeName,
    designation: body.designation,
    slipDate: body.slipDate,
    salaryMonth: body.salaryMonth,
    basicSalary: body.basicSalary,
    punctuality: body.punctuality,
    medicalAllowance: body.medicalAllowance,
    incentives: body.incentives,
    bonus: body.bonus,
    advance: body.advance,
    incomeTax: body.incomeTax,
    whTax: body.whTax,
    fuelAdvances: body.fuelAdvances,
    currency: body.currency,
    statusCode: body.statusCode,
    fromCompany: body.fromCompany,
    fromEmail: body.fromEmail,
    fromPhone: body.fromPhone,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => salarySlipsRepo.getSalarySlipById(body.id),
    notFoundMessage: "Salary slip not found",
    conflictMessage: "Salary slip version conflict",
  });
  return toPublic(row);
}

export async function archiveSalarySlip(
  actor: Actor,
  input: unknown,
): Promise<SalarySlipPublic> {
  requireAdmin(actor);
  const body = parseInput(salarySlipArchiveSchema, input);
  const updated = await salarySlipsRepo.archiveSalarySlip({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => salarySlipsRepo.getSalarySlipById(body.id),
    notFoundMessage: "Salary slip not found",
    conflictMessage: "Salary slip version conflict",
  });
  return toPublic(row);
}

export async function restoreSalarySlip(
  actor: Actor,
  input: unknown,
): Promise<SalarySlipPublic> {
  requireAdmin(actor);
  const body = parseInput(salarySlipRestoreSchema, input);
  const updated = await salarySlipsRepo.restoreSalarySlip({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => salarySlipsRepo.getSalarySlipById(body.id),
    notFoundMessage: "Salary slip not found",
    conflictMessage: "Salary slip version conflict",
  });
  return toPublic(row);
}
