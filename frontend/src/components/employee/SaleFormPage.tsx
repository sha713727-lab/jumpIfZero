"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import {
  employeeTodayLabel,
  useEmployeeDemo,
} from "@/components/employee/EmployeeDemoProvider";
import { CarrierSalesSheetFields } from "@/components/sales/CarrierSalesSheetFields";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import {
  emptyCarrierSaleFields,
  saleStatuses,
  saleStatusLabel,
  type CarrierSaleFields,
} from "@/constants/sales";
import type { AdminSale, SaleStatus } from "@/lib/data/admin";

const cardClass =
  "rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_24px_rgba(47,58,40,0.04)] md:p-6";

function fieldsFromSale(sale: AdminSale): CarrierSaleFields {
  return {
    usDot: sale.usDot,
    mc: sale.mc,
    legalName: sale.legalName,
    dba: sale.dba,
    businessAddress: sale.businessAddress,
    ownerOperatorDriver: sale.ownerOperatorDriver,
    taxId: sale.taxId,
    salesAgent: sale.salesAgent,
    businessTelephone: sale.businessTelephone,
    truckType: sale.truckType,
    type: sale.type,
    contactName: sale.contactName,
    contactPhone: sale.contactPhone,
    contactEmail: sale.contactEmail,
    truck: sale.truck,
    trailer: sale.trailer,
    insuranceName: sale.insuranceName,
    insurancePhone: sale.insurancePhone,
    insuranceStreet: sale.insuranceStreet,
    insuranceCityStateZip: sale.insuranceCityStateZip,
    insuranceEmail: sale.insuranceEmail,
    factoringName: sale.factoringName,
    factoringPhone: sale.factoringPhone,
    factoringStreet: sale.factoringStreet,
    factoringCityStateZip: sale.factoringCityStateZip,
    factoringEmail: sale.factoringEmail,
    approvedBy: sale.approvedBy,
  };
}

function SaleFormFields({
  initialFields,
  initialStatus,
  existing,
  employeeId,
  employeeName,
  sales,
  setSales,
}: Readonly<{
  initialFields: CarrierSaleFields;
  initialStatus: SaleStatus;
  existing: AdminSale | undefined;
  employeeId: string;
  employeeName: string;
  sales: AdminSale[];
  setSales: (items: AdminSale[]) => void;
}>) {
  const router = useRouter();
  const [fields, setFields] = useState(initialFields);
  const [status, setStatus] = useState(initialStatus);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isNew = !existing;

  const save = () => {
    const legalName = fields.legalName.trim();
    if (!legalName) {
      return;
    }

    const payload: AdminSale = {
      id: existing?.id ?? crypto.randomUUID(),
      repId: employeeId,
      status,
      ...fields,
      legalName,
      salesAgent: employeeName,
      updatedAt: employeeTodayLabel(),
    };

    if (existing) {
      setSales(sales.map((item) => (item.id === existing.id ? payload : item)));
    } else {
      setSales([...sales, payload]);
    }

    router.push("/employee/sales");
  };

  const confirmDelete = () => {
    if (!existing) {
      return;
    }

    setSales(sales.filter((item) => item.id !== existing.id));
    setDeleteOpen(false);
    router.push("/employee/sales");
  };

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title={isNew ? "New carrier sales sheet" : existing.legalName}
        lede={
          isNew
            ? "Fill the carrier sales sheet for Truck Dispatch."
            : `Updated ${existing.updatedAt}`
        }
      />

      <section className={`${cardClass} space-y-6`}>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Pipeline status</span>
            <select
            className={adminFieldClass}
            value={status}
            onChange={(event) => setStatus(event.target.value as SaleStatus)}
          >
            {saleStatuses.map((item) => (
              <option key={item} value={item}>
                {saleStatusLabel[item]}
              </option>
            ))}
          </select>
          </label>
        </div>

        <CarrierSalesSheetFields
          value={{ ...fields, salesAgent: employeeName }}
          salesAgentLocked
          onChange={setFields}
        />

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {!isNew ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold text-[#0d120b]"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.push("/employee/sales")}
            className="rounded-xl border border-black/12 bg-white px-4 py-2.5 text-[0.88rem] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
          >
            Save
          </button>
        </div>
      </section>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete sales sheet"
        lede={`Remove "${existing?.legalName ?? "this sheet"}" from your records?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export function SaleFormPage() {
  const params = useParams();
  const router = useRouter();
  const { state, setSales } = useEmployeeDemo();

  const saleId = typeof params.id === "string" ? params.id : "";
  const isNew = !saleId;
  const existing = isNew
    ? undefined
    : state.sales.find((item) => item.id === saleId);

  useEffect(() => {
    if (!isNew && !existing) {
      router.replace("/employee/sales");
    }
  }, [existing, isNew, router]);

  if (!isNew && !existing) {
    return null;
  }

  const initialFields = existing
    ? fieldsFromSale(existing)
    : {
        ...emptyCarrierSaleFields,
        salesAgent: state.employee.name,
      };

  return (
    <SaleFormFields
      key={existing?.id ?? "new"}
      initialFields={initialFields}
      initialStatus={existing?.status ?? "draft"}
      existing={existing}
      employeeId={state.employee.id}
      employeeName={state.employee.name}
      sales={state.sales}
      setSales={setSales}
    />
  );
}
