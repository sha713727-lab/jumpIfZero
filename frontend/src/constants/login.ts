export const loginCopy = {
  watermark: "Jump If Zero",
  title: "Sign in",
  lede: "Enter your credentials to continue.",
  emailLabel: "Email",
  passwordLabel: "Password",
  submit: "Sign in",
  submitting: "Signing in…",
  showPassword: "Show password",
  hidePassword: "Hide password",
  forgot: "Forgot password?",
  registerPrompt: "Don't have an account?",
  registerLink: "Register",
  registerHref: "/register" as const,
  orDivider: "or",
  google: "Continue with Google",
  googleSubmitting: "Connecting…",
  successTitle: "You're signed in",
  successCta: "Open dashboard",
  validationSummary: "Check the highlighted fields and try again.",
  serverError: "Sign-in failed. Please try again.",
  credentialsError: "Use the demo customer email and password.",
} as const;

export const forgotPasswordCopy = {
  title: "Reset password",
  lede: "Enter your email and we'll send a reset link.",
  emailLabel: "Email",
  submit: "Send reset link",
  submitting: "Sending…",
  close: "Close",
  successTitle: "Check your email",
  successLede:
    "If an account exists for that email, a reset link has been sent (demo).",
  done: "Back to sign in",
  validationEmail: "Enter a valid email.",
  requiredEmail: "Email is required.",
} as const;

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFieldErrors = {
  email?: string;
  password?: string;
};
