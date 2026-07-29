import type { RegisterFormValues } from "@/constants/register";

export type RegisterSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "server" };

export async function submitRegister(
  _values: RegisterFormValues,
): Promise<RegisterSubmitResult> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });

  return { ok: true };
}
