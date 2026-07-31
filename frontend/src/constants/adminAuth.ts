import { getDemoAdminCredentials } from "@/lib/env";

const credentials = getDemoAdminCredentials();

export const demoAdmin = {
  id: "admin_demo_001",
  name: "Alex Rivera",
  email: credentials.email,
  role: "Founder & Admin",
  initials: "AR",
} as const;

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

export type AdminLoginFormValues = {
  email: string;
  password: string;
};

export type AdminLoginFieldErrors = {
  email?: string;
  password?: string;
};
