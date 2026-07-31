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
