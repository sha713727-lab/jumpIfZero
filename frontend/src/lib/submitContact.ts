import type { ContactFormValues } from "@/constants/contact";

export type ContactSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "honeypot" | "server" };

const FORCE_ERROR = false;
const MOCK_DELAY_MS = 1200;

// MOCK — no email is sent. Replace before launch.
export async function submitContact(
  data: ContactFormValues,
): Promise<ContactSubmitResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MS);
  });

  if (data.website.trim().length > 0) {
    return { ok: false, reason: "honeypot" };
  }

  if (FORCE_ERROR) {
    return { ok: false, reason: "server" };
  }

  return { ok: true };
}
