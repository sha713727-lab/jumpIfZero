import type { Actor } from "@jumpifzero/contracts";
import type { SalarySlipDocumentModel } from "@/components/salaries/SalarySlipDocument";
import { getAdminSalarySlip } from "@/lib/data/adminOperations";
import { getSiteContact } from "@/lib/data/siteContact";
import { salarySlipDocumentFromPublic } from "@/lib/salarySlipDocumentFromPublic";

export async function loadSalarySlipDocument(
  actor: Actor,
  slipId: string,
): Promise<SalarySlipDocumentModel | null> {
  try {
    const [slip, siteContact] = await Promise.all([
      getAdminSalarySlip(actor, slipId),
      getSiteContact(),
    ]);
    const locationLines = siteContact.addressLines.filter(
      (line) => line.trim().length > 0,
    );
    return salarySlipDocumentFromPublic(slip, {
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
