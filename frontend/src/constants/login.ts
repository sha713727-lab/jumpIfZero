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
  createAccount: "Create an account",
  orDivider: "or",
  google: "Continue with Google",
  googleSubmitting: "Connecting…",
  successTitle: "You're signed in",
  successCta: "Open dashboard",
  validationSummary: "Check the highlighted fields and try again.",
  serverError: "Sign-in failed. Please try again.",
  credentialsError: "Invalid email or password.",
} as const;

export const registerCopy = {
  watermark: "Jump If Zero",
  title: "Create account",
  lede: "Register to access your client dashboard.",
  nameLabel: "Name",
  emailLabel: "Email",
  companyLabel: "Company",
  companyHint: "Optional",
  passwordLabel: "Password",
  confirmPasswordLabel: "Confirm password",
  submit: "Create account",
  submitting: "Creating account…",
  showPassword: "Show password",
  hidePassword: "Hide password",
  haveAccount: "Already have an account?",
  signIn: "Sign in",
  validationSummary: "Check the highlighted fields and try again.",
  serverError: "Could not create your account. Please try again.",
  conflictError: "An account with this email already exists.",
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
    "If an account exists for that email, a reset link has been sent.",
  done: "Back to sign in",
  validationEmail: "Enter a valid email.",
  requiredEmail: "Email is required.",
  serverError: "Could not send a reset link. Please try again.",
} as const;

export const resetPasswordCopy = {
  watermark: "Jump If Zero",
  title: "Choose a new password",
  lede: "Enter and confirm your new password to finish resetting.",
  passwordLabel: "New password",
  confirmPasswordLabel: "Confirm password",
  submit: "Update password",
  submitting: "Updating…",
  showPassword: "Show password",
  hidePassword: "Hide password",
  successTitle: "Password updated",
  successLede: "You can sign in with your new password.",
  successCta: "Back to sign in",
  missingToken: "This reset link is missing or incomplete.",
  validationPassword: "Password must be at least 8 characters.",
  validationConfirm: "Passwords must match.",
  unauthorized: "This reset link is invalid or has expired.",
  serverError: "Could not update your password. Please try again.",
} as const;

export type { LoginFormValues, LoginFieldErrors } from "@/schemas/login";
export type {
  RegisterFormValues,
  RegisterFieldErrors,
} from "@/schemas/register";
