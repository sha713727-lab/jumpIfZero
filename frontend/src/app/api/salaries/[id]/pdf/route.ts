import { actorSchema } from "@jumpifzero/contracts";
import { loadSalarySlipDocument } from "@/lib/data/adminSalarySlipDocument";
import { buildSalarySlipPdf } from "@/lib/salarySlipPdf";
import { verifySession } from "@/lib/session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  if (!id) {
    return new Response(null, { status: 400 });
  }

  const session = await verifySession("admin");
  if (!session) {
    return new Response(null, { status: 401 });
  }

  const actor = actorSchema.parse({
    subjectId: session.subjectId,
    role: "admin",
    employeeKind: null,
  });

  const slip = await loadSalarySlipDocument(actor, id);
  if (!slip) {
    return new Response(null, { status: 404 });
  }

  const pdf = buildSalarySlipPdf(slip);
  return new Response(Buffer.from(pdf.bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
