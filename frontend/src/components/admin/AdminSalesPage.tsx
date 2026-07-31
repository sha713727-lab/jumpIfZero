"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTodayLabel, useAdminDemo } from "@/components/admin/AdminDemoProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import { CarrierSalesSheetFields } from "@/components/sales/CarrierSalesSheetFields";
import { adminEmptyCopy } from "@/constants/admin";
import {
  emptyCarrierSaleFields,
  maskTaxId,
  saleStatuses,
  saleStatusLabel,
  type CarrierSaleFields,
} from "@/constants/sales";
import type { AdminSale, SaleStatus } from "@/lib/data/admin";
import { EmptyState } from "@/components/ui/EmptyState";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

const statusPillClass: Record<SaleStatus, string> = {
  draft: "bg-black/8 text-black/50",
  quoted: "bg-[rgba(249,161,55,0.18)] text-[#e8891a]",
  won: "bg-[rgba(116,129,95,0.12)] text-brand",
  lost: "bg-[rgba(47,58,40,0.12)] text-[#2f3a28]",
};

type SaleForm = CarrierSaleFields & {
  repId: string;
  status: SaleStatus;
};

function fieldsFromSale(sale: AdminSale): SaleForm {
  return {
    repId: sale.repId,
    status: sale.status,
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

const emptyForm: SaleForm = {
  repId: "",
  status: "draft",
  ...emptyCarrierSaleFields,
};

export function AdminSalesPage() {
  const { state, setSales } = useAdminDemo();
  const [statusFilter, setStatusFilter] = useState<SaleStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<SaleForm>(emptyForm);

  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;

  const salesEmployees = state.employees.filter(
    (item) => item.kind === "sales" && item.active,
  );

  const repName = (repId: string) =>
    state.employees.find((item) => item.id === repId)?.name;

  const filtered = state.sales.filter(
    (item) => statusFilter === "all" || item.status === statusFilter,
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: AdminSale) => {
    setEditingId(item.id);
    setForm(fieldsFromSale(item));
    setModalOpen(true);
  };

  const save = () => {
    const legalName = form.legalName.trim();
    if (!legalName || !form.repId) {
      return;
    }

    const selectedRep = salesEmployees.find((item) => item.id === form.repId);
    if (!selectedRep) {
      return;
    }

    const {
      repId,
      status,
      ...carrierFields
    } = form;

    const payload: AdminSale = {
      id: editingId ?? crypto.randomUUID(),
      repId,
      status,
      ...carrierFields,
      legalName,
      salesAgent: form.salesAgent.trim() || selectedRep.name,
      updatedAt: adminTodayLabel(),
    };

    if (editingId) {
      setSales(
        state.sales.map((item) => (item.id === editingId ? payload : item)),
      );
    } else {
      setSales([...state.sales, payload]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    setSales(state.sales.filter((item) => item.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const deleteTarget = state.sales.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sales"
        lede="Carrier sales sheets across the sales team."
        actionLabel="Add sale"
        onAction={openAdd}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-[0.84rem] font-semibold text-black/50">
          Status
        </label>
        <select
          className={`${adminFieldClass} w-auto min-w-[10rem]`}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as SaleStatus | "all")
          }
        >
          <option value="all">All</option>
          {saleStatuses.map((status) => (
            <option key={status} value={status}>
              {saleStatusLabel[status]}
            </option>
          ))}
        </select>
      </div>

      <div className={cardClass}>
        {filtered.length === 0 ? (
          <EmptyState message={adminEmptyCopy.sales} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left">
              <thead>
                <tr className="border-b border-black/8 bg-[#f3f5ef]/60">
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Carrier
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Rep
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    DOT / MC
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {filtered.map((item) => {
                  const rep = repName(item.repId);

                  return (
                    <tr key={item.id} className="hover:bg-[#f3f5ef]/40">
                      <td className="px-4 py-3">
                        <p className="text-[0.9rem] font-semibold text-[#0d120b]">
                          {item.legalName}
                        </p>
                        <p className="text-[0.82rem] font-medium text-black/45">
                          {item.truckType || item.type}
                          {item.taxId ? ` · Tax ${maskTaxId(item.taxId)}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                        {rep}
                      </td>
                      <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                        {item.usDot || "—"} / {item.mc || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${statusPillClass[item.status]}`}
                        >
                          {saleStatusLabel[item.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[0.84rem] font-medium text-black/50">
                        {item.updatedAt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Edit"
                            onClick={() => openEdit(item)}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                          >
                            <EditIcon className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete"
                            onClick={() => {
                              setDeleteId(item.id);
                              setDeleteOpen(true);
                            }}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminFormModal
        open={modalOpen}
        title={editingId ? "Edit carrier sales sheet" : "Add carrier sales sheet"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        <div>
          <label className={adminLabelClass}>Rep</label>
          <select
            className={adminFieldClass}
            value={form.repId}
            onChange={(event) => {
              const nextRepId = event.target.value;
              const rep = salesEmployees.find((item) => item.id === nextRepId);
              setForm((current) => ({
                ...current,
                repId: nextRepId,
                salesAgent: rep?.name ?? current.salesAgent,
              }));
            }}
          >
            <option value="">Select rep</option>
            {salesEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabelClass}>Pipeline status</label>
          <select
            className={adminFieldClass}
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as SaleStatus,
              }))
            }
          >
            {saleStatuses.map((status) => (
              <option key={status} value={status}>
                {saleStatusLabel[status]}
              </option>
            ))}
          </select>
        </div>
        <CarrierSalesSheetFields
          value={form}
          onChange={(next) =>
            setForm((current) => ({
              ...current,
              ...next,
              repId: current.repId,
              status: current.status,
            }))
          }
        />
      </AdminFormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete sales sheet"
        lede={`Remove "${deleteTarget?.legalName ?? "this sheet"}"?`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
