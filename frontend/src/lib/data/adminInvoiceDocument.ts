import { getAdminInvoice } from "@/lib/data/adminOperations";
import type { InvoiceDocumentModel } from "@/components/invoices/InvoiceDocument";
import { invoiceDocumentFromPublic } from "@/lib/invoiceDocumentFromPublic";
import { getSiteContact } from "@/lib/data/siteContact";
import type { Actor } from "@jumpifzero/contracts";

export async function loadInvoiceDocument(
  actor: Actor,
  invoiceId: string,
): Promise<InvoiceDocumentModel | null> {
  try {
    const [invoice, siteContact] = await Promise.all([
      getAdminInvoice(actor, invoiceId),
      getSiteContact(),
    ]);
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
