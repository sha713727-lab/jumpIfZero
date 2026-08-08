const INVOICE_NUMBER_RE = /^INV-(\d{4})-(\d{1,6})$/i;

export function nextInvoiceNumber(
  existingNumbers: readonly string[],
  now = new Date(),
): string {
  const year = String(now.getUTCFullYear());
  let maxSeq = 0;

  for (const raw of existingNumbers) {
    const match = INVOICE_NUMBER_RE.exec(raw.trim());
    if (!match) {
      continue;
    }
    if (match[1] !== year) {
      continue;
    }
    const seq = Number(match[2]);
    if (Number.isFinite(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }

  return `INV-${year}-${String(maxSeq + 1).padStart(3, "0")}`;
}
