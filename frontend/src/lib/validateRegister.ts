import type { RegisterFieldErrors, RegisterFormValues } from "@/constants/register";

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const company = values.company.trim();
  const password = values.password;
  const confirmPassword = values.confirmPassword;

  if (!name) {
    errors.name = "Full name is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email.";
  }

  if (!company) {
    errors.company = "Company is required.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
