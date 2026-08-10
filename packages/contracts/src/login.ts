import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .pipe(z.email({ error: "Enter a valid email." })),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters."),
});

export type LoginFormValues = z.input<typeof loginFormSchema>;
export type LoginFormParsed = z.output<typeof loginFormSchema>;

export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export function loginFieldErrors(
  error: z.ZodError,
): LoginFieldErrors {
  const fieldErrors: LoginFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (key !== "email" && key !== "password") {
      continue;
    }

    if (fieldErrors[key]) {
      continue;
    }

    fieldErrors[key] = issue.message;
  }

  return fieldErrors;
}

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(200, "Name is too long."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .pipe(z.email({ error: "Enter a valid email." })),
    company: z.string().trim().max(200, "Company is too long."),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .max(200, "Password is too long."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.input<typeof registerFormSchema>;
export type RegisterFormParsed = z.output<typeof registerFormSchema>;

export type RegisterFieldErrors = {
  name?: string;
  email?: string;
  company?: string;
  password?: string;
  confirmPassword?: string;
};

export function registerFieldErrors(
  error: z.ZodError,
): RegisterFieldErrors {
  const fieldErrors: RegisterFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (
      key !== "name" &&
      key !== "email" &&
      key !== "company" &&
      key !== "password" &&
      key !== "confirmPassword"
    ) {
      continue;
    }

    if (fieldErrors[key]) {
      continue;
    }

    fieldErrors[key] = issue.message;
  }

  return fieldErrors;
}
