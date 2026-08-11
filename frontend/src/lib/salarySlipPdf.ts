import type { SalarySlipDocumentModel } from "@/components/salaries/SalarySlipDocument";

function pdfEscape(value: string): string {
  return value
    .replace(/\u2014|\u2013/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function sanitizeFilename(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.length > 0 ? cleaned.slice(0, 80) : "salary-slip";
}

function formatMoney(amount: string, currency: string): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return `${currency} ${amount}`;
  }
  return `${currency} ${numeric.toFixed(2)}`;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function buildSalarySlipPdf(
  slip: SalarySlipDocumentModel,
): { readonly bytes: Uint8Array; readonly filename: string } {
  const brand = slip.company.legalName || "JZ Enterprises";
  const money = (v: string) => formatMoney(v, slip.currency);
  const lines: string[] = [];
  let y = 800;

  const text = (content: string, x: number, size = 11, bold = false) => {
    lines.push("BT");
    lines.push(`/${bold ? "F2" : "F1"} ${size} Tf`);
    lines.push(`${x} ${y} Td`);
    lines.push(`(${pdfEscape(content)}) Tj`);
    lines.push("ET");
    y -= size + 6;
  };

  text("SALARY SLIP", 50, 16, true);
  text(brand, 50, 14, true);
  text(`Salary Month: ${slip.salaryMonth}`, 50, 11);
  text(`Date: ${formatDate(slip.slipDate)}`, 50, 11);
  y -= 8;
  text(`Employee Name: ${slip.employeeName}`, 50, 11, true);
  text(`Designation: ${slip.designation || "-"}`, 50, 11);
  y -= 10;
  text("EARNINGS", 50, 12, true);
  text(`Basic Salary: ${money(slip.basicSalary)}`, 50);
  text(`Punctuality: ${money(slip.punctuality)}`, 50);
  text(`Medical Allowance: ${money(slip.medicalAllowance)}`, 50);
  text(`Incentives: ${money(slip.incentives)}`, 50);
  text(`Bonus: ${money(slip.bonus)}`, 50);
  text(`Total Earnings: ${money(slip.totalEarnings)}`, 50, 11, true);
  y -= 8;
  text("DEDUCTIONS", 50, 12, true);
  text(`Advance: ${money(slip.advance)}`, 50);
  text(`Income Tax: ${money(slip.incomeTax)}`, 50);
  text(`W.H. Tax: ${money(slip.whTax)}`, 50);
  text(`Fuel Advances: ${money(slip.fuelAdvances)}`, 50);
  text(`Total Deduction: ${money(slip.totalDeduction)}`, 50, 11, true);
  y -= 8;
  text(`NET SALARY: ${money(slip.netSalary)}`, 50, 14, true);
  y -= 16;
  text("Employ Signature: ____________________", 50);
  text("Authorised Signatory: ____________________", 50);
  y -= 10;
  text(
    "This is a system-generated salary slip and is valid without a physical signature.",
    50,
    9,
  );
  if (slip.footer.phone) {
    text(slip.footer.phone, 50, 9);
  }
  if (slip.footer.email) {
    text(slip.footer.email, 50, 9);
  }
  for (const line of slip.footer.locationLines) {
    text(line, 50, 9);
  }

  const content = `${lines.join("\n")}\n`;
  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n");
  objects.push(
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>endobj\n",
  );
  objects.push(
    `4 0 obj<< /Length ${Buffer.byteLength(content, "utf8")} >>stream\n${content}endstream\nendobj\n`,
  );
  objects.push(
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  );
  objects.push(
    "6 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>endobj\n",
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF\n`;

  return {
    bytes: new Uint8Array(Buffer.from(pdf, "utf8")),
    filename: `salary-slip-${sanitizeFilename(slip.employeeName)}-${sanitizeFilename(slip.salaryMonth)}.pdf`,
  };
}
