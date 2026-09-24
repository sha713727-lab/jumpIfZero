"use client";

import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";

export type InvoiceLineFormItem = {
  description: string;
  amount: string;
};

type InvoiceLineItemsFieldsProps = {
  readonly lines: readonly InvoiceLineFormItem[];
  readonly currency: string;
  readonly onChange: (lines: InvoiceLineFormItem[]) => void;
};

function sumLineAmounts(lines: readonly InvoiceLineFormItem[]): string {
  let totalCents = 0;
  for (const line of lines) {
    const cleaned = line.amount.replace(/[^\d.]/g, "");
    if (cleaned.length === 0) {
      continue;
    }
    const numeric = Number(cleaned);
    if (!Number.isFinite(numeric)) {
      continue;
    }
    totalCents += Math.round(numeric * 100);
  }
  const whole = Math.floor(totalCents / 100);
  const frac = String(totalCents % 100).padStart(2, "0");
  return `${whole}.${frac}`;
}

export function InvoiceLineItemsFields({
  lines,
  currency,
  onChange,
}: InvoiceLineItemsFieldsProps) {
  const total = sumLineAmounts(lines);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className={adminLabelClass}>Line items</span>
        <button
          type="button"
          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-brand"
          onClick={() =>
            onChange([...lines, { description: "", amount: "" }])
          }
        >
          + Add line
        </button>
      </div>
      <ul className="space-y-3">
        {lines.map((line, index) => (
          <li
            key={index}
            className="grid gap-3 rounded-xl border border-black/8 bg-[#f7f8f4] p-3 sm:grid-cols-[1fr_8rem_auto]"
          >
            <label className="block sm:col-span-1">
              <span className={adminLabelClass}>Description</span>
              <input
                className={adminFieldClass}
                value={line.description}
                onChange={(event) => {
                  const next = lines.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, description: event.target.value }
                      : item,
                  );
                  onChange(next);
                }}
                placeholder="Website development — Phase 1"
              />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Amount</span>
              <input
                className={adminFieldClass}
                value={line.amount}
                onChange={(event) => {
                  const next = lines.map((item, itemIndex) =>
                    itemIndex === index
                      ? { ...item, amount: event.target.value }
                      : item,
                  );
                  onChange(next);
                }}
                placeholder="1000.00"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                disabled={lines.length <= 1}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem] font-semibold text-black/55 disabled:opacity-40"
                onClick={() =>
                  onChange(lines.filter((_, itemIndex) => itemIndex !== index))
                }
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[0.88rem] font-semibold text-[#0d120b]">
        Total: {currency} {total}
      </p>
    </div>
  );
}

export function emptyInvoiceLine(): InvoiceLineFormItem {
  return { description: "", amount: "" };
}
