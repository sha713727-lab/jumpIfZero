import type {
  ContactFieldErrors,
  ContactFormValues,
} from "@/constants/contact";
import { budgetBands, projectTypes } from "@/constants/contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(
  values: ContactFormValues,
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const company = values.company.trim();
  const message = values.message.trim();

  if (name.length < 2 || name.length > 80) {
    errors.name = "Enter your name (2–80 characters).";
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 120) {
    errors.email = "Enter a valid email.";
  }

  if (company.length > 120) {
    errors.company = "Keep company under 120 characters.";
  }

  if (
    !values.projectType ||
    !projectTypes.includes(values.projectType)
  ) {
    errors.projectType = "Select a project type.";
  }

  if (values.budget && !budgetBands.includes(values.budget)) {
    errors.budget = "Select a valid budget band.";
  }

  if (message.length < 40 || message.length > 2000) {
    errors.message = "Message must be 40–2000 characters.";
  }

  return errors;
}
