"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { employeeIcons } from "@/components/employee/EmployeeIcons";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployee } from "@/components/employee/EmployeeProvider";
import { employeeEmptyCopy } from "@/constants/employee";
import { maskTaxId, saleStatusLabel } from "@/constants/sales";
import type { SaleStatus } from "@/lib/data/admin";
import { archiveSaleAction } from "@/lib/submitCrm";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const statusPillClass: Record<SaleStatus, string> = {
  draft: "bg-black/8 text-black/50",
  quoted: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  won: "bg-[rgba(92,104,73,0.12)] text-brand",
  lost: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

export function SalesListPage() {
  const router = useRouter();
  const { state, setSales } = useEmployee();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const TrashIcon = employeeIcons.trash;

  const sales = [...state.sales].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const deleteTarget = sales.find((item) => item.id === deleteId);

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }
    startTransition(async () => {
      const result = await archiveSaleAction({
        id: deleteTarget.id,
        version: deleteTarget.version,
      });
      if (result.ok) {
        setSales(state.sales.filter((item) => item.id !== deleteTarget.id));
        setDeleteOpen(false);
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="Sales"
        lede="Carrier sales sheets for Truck Dispatch."
        actionLabel="Add sale"
        onAction={() => router.push("/employee/sales/new")}
      />

      <div className={cardClass}>
        {sales.length === 0 ? (
          <EmptyState message={employeeEmptyCopy.sales} />
        ) : (
          <ul className="divide-y divide-black/8">
            {sales.map((sale) => (
              <li
                key={sale.id}
                className="flex items-stretch gap-2 px-3 py-2 sm:px-4"
              >
                <Link
                  href={`/employee/sales/${sale.id}`}
                  className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                      {sale.legalName}
                    </p>
                    <p className="text-[0.82rem] font-medium text-black/45">
                      DOT {sale.usDot || "—"} · MC {sale.mc || "—"} ·{" "}
                      {sale.truckType || "Carrier"}
                    </p>
                    {sale.taxId ? (
                      <p className="mt-1 text-[0.78rem] font-medium text-black/35">
                        Tax ID {maskTaxId(sale.taxId)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusPillClass[sale.status]}`}
                    >
                      {saleStatusLabel[sale.status]}
                    </span>
                    <span className="text-[0.8rem] font-medium text-black/35">
                      {sale.updatedAt}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${sale.legalName}`}
                  disabled={pending}
                  onClick={() => {
                    setDeleteId(sale.id);
                    setDeleteOpen(true);
                  }}
                  className="my-auto inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white text-[#0d120b] transition-colors hover:border-black/20 hover:bg-[#f3f5ef] disabled:opacity-50"
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete sales sheet"
        lede={`Remove "${deleteTarget?.legalName ?? "this sheet"}" from your records?`}
        onClose={() => {
          if (!pending) {
            setDeleteOpen(false);
            setDeleteId(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
