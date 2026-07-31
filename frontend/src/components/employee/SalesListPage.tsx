"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployeeDemo } from "@/components/employee/EmployeeDemoProvider";
import { maskTaxId, saleStatusLabel } from "@/constants/sales";
import type { SaleStatus } from "@/constants/adminDemo";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const statusPillClass: Record<SaleStatus, string> = {
  draft: "bg-black/8 text-black/50",
  quoted: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  won: "bg-[rgba(116,129,95,0.12)] text-brand",
  lost: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

export function SalesListPage() {
  const router = useRouter();
  const { state } = useEmployeeDemo();

  const sales = [...state.sales].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="Sales"
        lede="Carrier sales sheets for Truck Dispatch."
        actionLabel="Add sale"
        onAction={() => router.push("/employee/sales/new")}
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8">
          {sales.map((sale) => (
            <li key={sale.id}>
              <Link
                href={`/employee/sales/${sale.id}`}
                className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[#f3f5ef]/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[0.92rem] font-semibold text-[#0d120b]">
                    {sale.legalName}
                  </p>
                  <p className="text-[0.82rem] font-medium text-black/45">
                    DOT {sale.usDot || "—"} · MC {sale.mc || "—"} ·{" "}
                    {sale.truckType || sale.type || "Carrier"}
                  </p>
                  {sale.taxId ? (
                    <p className="mt-1 text-[0.78rem] font-medium text-black/35">
                      Tax ID {maskTaxId(sale.taxId)}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
