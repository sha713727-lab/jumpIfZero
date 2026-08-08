export function adminInitialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return "AD";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
}

export const adminLoginCopy = {
  watermark: "Jump If Zero",
  title: "Admin",
  lede: "Sign in to the admin portal.",
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

export type { LoginFormValues as AdminLoginFormValues, LoginFieldErrors as AdminLoginFieldErrors } from "@/schemas/login";
