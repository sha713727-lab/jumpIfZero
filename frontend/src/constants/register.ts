export const registerCopy = {
  watermark: "Jump If Zero",
  title: "Register",
  lede: "Create your customer account to access projects and files.",
  nameLabel: "Full name",
  emailLabel: "Email",
  companyLabel: "Company",
  passwordLabel: "Password",
  confirmLabel: "Confirm password",
  submit: "Create account",
  submitting: "Creating…",
  showPassword: "Show password",
  hidePassword: "Hide password",
  loginPrompt: "Already have an account?",
  loginLink: "Sign in",
  loginHref: "/login" as const,
  orDivider: "or",
  google: "Continue with Google",
  googleSubmitting: "Connecting…",
  validationSummary: "Check the highlighted fields and try again.",
  serverError: "Registration failed. Please try again.",
} as const;

export type RegisterFormValues = {
  name: string;
  email: string;
  company: string;
  password: string;
  confirmPassword: string;
};

export type RegisterFieldErrors = {
  name?: string;
  email?: string;
  company?: string;
  password?: string;
  confirmPassword?: string;
};
