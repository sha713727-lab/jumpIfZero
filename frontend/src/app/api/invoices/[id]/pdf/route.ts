import { actorSchema, invoicePublicSchema } from "@jumpifzero/contracts";
import type { InvoiceDocumentModel } from "@/components/invoices/InvoiceDocument";
import { backendRequest } from "@/lib/backend/client";
import { getOwnClient } from "@/lib/data/customerPortal";
import { getSiteContact } from "@/lib/data/siteContact";
import { invoiceDocumentFromPublic } from "@/lib/invoiceDocumentFromPublic";
import { buildInvoicePdf } from "@/lib/invoicePdf";
import { verifySession } from "@/lib/session";

async function loadInvoiceForDownload(
  actor: {
    readonly subjectId: string;
    readonly role: "admin" | "client" | "employee";
    readonly employeeKind: "delivery" | "sales" | null;
  },
  invoiceId: string,
): Promise<InvoiceDocumentModel | null> {
  try {
    const [invoice, siteContact] = await Promise.all([
      backendRequest({
        method: "GET",
        path: `/invoices/${invoiceId}`,
        actor,
        outputSchema: invoicePublicSchema,
      }),
      getSiteContact(),
    ]);

    if (actor.role === "client") {
      const own = await getOwnClient(actor);
      if (invoice.clientId !== own.id) {
        return null;
      }
    }

    const locationLines = siteContact.addressLines.filter(
      (line) => line.trim().length > 0,
    );

    return invoiceDocumentFromPublic(invoice, {
      footer: {
        phone: siteContact.phone,
        email: siteContact.email,
        locationLines:
          locationLines.length > 0
            ? locationLines
            : siteContact.locationLede.trim().length > 0
              ? [siteContact.locationLede.trim()]
              : [],
      },
    });
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  if (!id) {
    return new Response(null, { status: 400 });
  }

  const session =
    (await verifySession("admin")) ??
    (await verifySession("customer")) ??
    (await verifySession("employee"));

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const actor = actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: session.employeeKind ?? null,
  });

  const invoice = await loadInvoiceForDownload(actor, id);
  if (!invoice) {
    return new Response(null, { status: 404 });
  }

  const pdf = buildInvoicePdf(invoice);

  return new Response(Buffer.from(pdf.bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
