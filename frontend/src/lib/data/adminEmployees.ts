import type { Actor } from "@jumpifzero/contracts";
import {
  employeePublicSchema,
  passwordChangeResponseSchema,
  userPublicSchema,
  type EmployeePublic,
} from "@jumpifzero/contracts";
import type { AdminEmployee } from "@jumpifzero/contracts/admin";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function toAdminEmployee(
  row: EmployeePublic,
  fallback?: {
    readonly name?: string;
    readonly email?: string;
  },
): AdminEmployee {
  return {
    id: row.id,
    name: row.user?.name ?? fallback?.name ?? row.title,
    email: row.user?.email ?? fallback?.email ?? "",
    role: row.title,
    department: row.department,
    kind: row.kind,
    image: row.imagePath,
    active: row.archivedAt === null,
    teamMemberId: null,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export async function createAdminEmployee(
  actor: Actor,
  input: {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly role: string;
    readonly department: string;
    readonly kind: "delivery" | "sales";
    readonly image: string;
    readonly active: boolean;
  },
): Promise<AdminEmployee> {
  const title = input.role.trim().length > 0 ? input.role.trim() : null;

  const user = await backendRequest({
    method: "POST",
    path: "/users",
    body: {
      email: input.email.trim(),
      password: input.password,
      name: input.name.trim(),
      title,
      role: "employee",
    },
    actor,
    outputSchema: userPublicSchema,
  });

  let employee = await backendRequest({
    method: "POST",
    path: "/employees",
    body: {
      userId: user.id,
      title: input.role.trim(),
      department: input.department.trim(),
      kind: input.kind,
      imagePath: input.image,
    },
    actor,
    outputSchema: employeePublicSchema,
  });

  if (!input.active) {
    employee = await backendRequest({
      method: "POST",
      path: `/employees/${employee.id}/archive`,
      body: { version: employee.version },
      actor,
      outputSchema: employeePublicSchema,
    });
  }

  return toAdminEmployee(
    {
      ...employee,
      user: {
        email: user.email,
        name: user.name,
        title: user.title,
        role: "employee",
      },
    },
  );
}

export async function updateAdminEmployee(
  actor: Actor,
  input: {
    readonly employeeId: string;
    readonly name: string;
    readonly email: string;
    readonly role: string;
    readonly department: string;
    readonly kind: "delivery" | "sales";
    readonly image: string;
    readonly active: boolean;
  },
): Promise<AdminEmployee> {
  let employee = await backendRequest({
    method: "GET",
    path: `/employees/${input.employeeId}`,
    actor,
    outputSchema: employeePublicSchema,
  });

  const user = await backendRequest({
    method: "GET",
    path: `/users/${employee.userId}`,
    actor,
    outputSchema: userPublicSchema,
  });

  const title = input.role.trim().length > 0 ? input.role.trim() : null;

  const updatedUser = await backendRequest({
    method: "PATCH",
    path: `/users/${user.id}`,
    body: {
      version: user.version,
      name: input.name.trim(),
      title,
      email: input.email.trim(),
    },
    actor,
    outputSchema: userPublicSchema,
  });

  employee = await backendRequest({
    method: "PATCH",
    path: `/employees/${employee.id}`,
    body: {
      version: employee.version,
      title: input.role.trim(),
      department: input.department.trim(),
      imagePath: input.image,
    },
    actor,
    outputSchema: employeePublicSchema,
  });

  if (employee.kind !== input.kind) {
    employee = await backendRequest({
      method: "POST",
      path: `/employees/${employee.id}/kind`,
      body: {
        version: employee.version,
        kind: input.kind,
      },
      actor,
      outputSchema: employeePublicSchema,
    });
  }

  const isActive = employee.archivedAt === null;
  if (input.active && !isActive) {
    employee = await backendRequest({
      method: "POST",
      path: `/employees/${employee.id}/restore`,
      body: { version: employee.version },
      actor,
      outputSchema: employeePublicSchema,
    });
  } else if (!input.active && isActive) {
    employee = await backendRequest({
      method: "POST",
      path: `/employees/${employee.id}/archive`,
      body: { version: employee.version },
      actor,
      outputSchema: employeePublicSchema,
    });
  }

  return toAdminEmployee(
    {
      ...employee,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        title: updatedUser.title,
        role: "employee",
      },
    },
  );
}

export async function setAdminEmployeePassword(
  actor: Actor,
  input: {
    readonly employeeId: string;
    readonly password: string;
  },
): Promise<void> {
  const employee = await backendRequest({
    method: "GET",
    path: `/employees/${input.employeeId}`,
    actor,
    outputSchema: employeePublicSchema,
  });

  const user = await backendRequest({
    method: "GET",
    path: `/users/${employee.userId}`,
    actor,
    outputSchema: userPublicSchema,
  });

  await backendRequest({
    method: "POST",
    path: `/users/${user.id}/password`,
    body: {
      version: user.version,
      password: input.password,
    },
    actor,
    outputSchema: passwordChangeResponseSchema,
  });
}

export async function archiveAdminEmployee(
  actor: Actor,
  employeeId: string,
): Promise<void> {
  const employee = await backendRequest({
    method: "GET",
    path: `/employees/${employeeId}`,
    actor,
    outputSchema: employeePublicSchema,
  });

  await backendRequest({
    method: "POST",
    path: `/employees/${employee.id}/archive`,
    body: { version: employee.version },
    actor,
    outputSchema: employeePublicSchema,
  });

  const user = await backendRequest({
    method: "GET",
    path: `/users/${employee.userId}`,
    actor,
    outputSchema: userPublicSchema,
  });

  await backendRequest({
    method: "POST",
    path: `/users/${user.id}/archive`,
    body: { version: user.version },
    actor,
    outputSchema: userPublicSchema,
  });
}
