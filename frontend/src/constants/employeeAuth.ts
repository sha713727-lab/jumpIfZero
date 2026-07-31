export const employeeLoginCopy = {
  watermark: "Jump If Zero",
  title: "Employee",
  lede: "Sign in to the employee portal.",
  emailLabel: "Email",
  passwordLabel: "Password",
  submit: "Sign in",
  submitting: "Signing in…",
  showPassword: "Show password",
  hidePassword: "Hide password",
  forgot: "Forgot password?",
  orDivider: "or",
  google: "Continue with Google",
  googleSubmitting: "Connecting…",
  validationSummary: "Check the highlighted fields and try again.",
  serverError: "Sign-in failed. Please try again.",
  credentialsError: "Invalid email or password.",
} as const;

export type { LoginFormValues as EmployeeLoginFormValues, LoginFieldErrors as EmployeeLoginFieldErrors } from "@/schemas/login";
