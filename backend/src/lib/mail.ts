import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.ts";
import { logger } from "./logger.ts";

export type InvoiceMailInput = {
  readonly to: string;
  readonly clientName: string;
  readonly invoiceNumber: string;
  readonly title: string;
  readonly amount: string;
  readonly currency: string;
  readonly issuedOn: string | null;
  readonly dueDate: string | null;
  readonly viewUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildInvoiceHtml(input: InvoiceMailInput): string {
  const amountLabel = `${escapeHtml(input.currency)} ${escapeHtml(input.amount)}`;
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f5f0;font-family:Arial,sans-serif;color:#0d120b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e2e4de;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#5c6849;color:#f7f5f0;">
                <div style="font-size:20px;font-weight:700;">JZ Enterprises</div>
                <div style="margin-top:4px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.85;">Jump If Zero</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 12px;font-size:15px;">Hi ${escapeHtml(input.clientName)},</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3a4034;">
                  Your invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> is ready.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#f7f5f0;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7363;">Description</div>
                      <div style="margin-top:6px;font-size:15px;font-weight:600;">${escapeHtml(input.title)}</div>
                      <div style="margin-top:14px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7363;">Amount due</div>
                      <div style="margin-top:6px;font-size:22px;font-weight:700;color:#5c6849;">${amountLabel}</div>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7363;">Issued: ${escapeHtml(input.issuedOn ?? "—")}</p>
                <p style="margin:0 0 24px;font-size:13px;color:#6b7363;">Due: ${escapeHtml(input.dueDate ?? "—")}</p>
                <a href="${escapeHtml(input.viewUrl)}" style="display:inline-block;background:#5c6849;color:#f7f5f0;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:13px;font-weight:700;">
                  View invoice
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px;font-size:12px;color:#6b7363;">
                Questions? Reply to this email or contact ${escapeHtml(env.EMAIL_FROM)}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendViaResend(input: {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
}): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (apiKey === undefined) {
    throw new Error("RESEND_API_KEY missing");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend failed with status ${response.status}`);
  }
}

async function sendViaDemo(input: {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly outboxKey: string;
}): Promise<string> {
  const outboxDir = path.join(env.FILE_STORAGE_ROOT, "mail-outbox");
  await mkdir(outboxDir, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-");
  const fileName = `${stamp}-${input.outboxKey.replaceAll(/[^a-zA-Z0-9_-]/g, "_")}.json`;
  const filePath = path.join(outboxDir, fileName);
  await writeFile(
    filePath,
    JSON.stringify(
      {
        provider: "demo",
        from: env.EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );
  return filePath;
}

function buildPasswordResetHtml(input: {
  readonly resetUrl: string;
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f5f0;font-family:Arial,sans-serif;color:#0d120b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e2e4de;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#5c6849;color:#f7f5f0;">
                <div style="font-size:20px;font-weight:700;">JZ Enterprises</div>
                <div style="margin-top:4px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.85;">Jump If Zero</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 12px;font-size:15px;">Password reset</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3a4034;">
                  Use the button below to choose a new password. This link expires soon and can only be used once.
                </p>
                <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;background:#5c6849;color:#f7f5f0;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:13px;font-weight:700;">
                  Reset password
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px;font-size:12px;color:#6b7363;">
                If you did not request this, you can ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPasswordResetEmail(input: {
  readonly to: string;
  readonly resetUrl: string;
}): Promise<{ readonly provider: "demo" | "resend"; readonly ok: true }> {
  const subject = "Reset your JZ Enterprises password";
  const html = buildPasswordResetHtml({ resetUrl: input.resetUrl });

  if (env.EMAIL_PROVIDER === "resend") {
    await sendViaResend({
      to: input.to,
      subject,
      html,
    });
    logger.info({
      msg: "password_reset_mail_sent",
      route: "mail.password_reset",
    });
    return { provider: "resend", ok: true };
  }

  await sendViaDemo({
    to: input.to,
    subject,
    html,
    outboxKey: "password-reset",
  });
  logger.info({
    msg: "password_reset_mail_demo_queued",
    route: "mail.password_reset",
  });
  return { provider: "demo", ok: true };
}

export async function sendInvoiceEmail(
  input: InvoiceMailInput,
): Promise<{ readonly provider: "demo" | "resend"; readonly ok: true }> {
  const subject = `Invoice ${input.invoiceNumber} from JZ Enterprises`;
  const html = buildInvoiceHtml(input);

  if (env.EMAIL_PROVIDER === "resend") {
    await sendViaResend({
      to: input.to,
      subject,
      html,
    });
    logger.info({
      msg: "invoice_mail_sent",
      route: "mail.invoice",
    });
    return { provider: "resend", ok: true };
  }

  await sendViaDemo({
    to: input.to,
    subject,
    html,
    outboxKey: input.invoiceNumber,
  });
  logger.info({
    msg: "invoice_mail_demo_queued",
    route: "mail.invoice",
  });
  return { provider: "demo", ok: true };
}
