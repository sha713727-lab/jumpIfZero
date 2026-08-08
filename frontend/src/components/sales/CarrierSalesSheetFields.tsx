"use client";

import { useState } from "react";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import type { CarrierSaleFields } from "@/constants/sales";
import { saleCurrencies } from "@/constants/sales";
import { revealCarrierTaxIdAction } from "@/lib/submitCrm";

type CarrierSalesSheetFieldsProps = {
  readonly value: CarrierSaleFields;
  readonly onChange: (next: CarrierSaleFields) => void;
  readonly salesAgentLocked?: boolean;
  readonly taxIdEditMode?: boolean;
  readonly carrierId?: string | undefined;
};

function setField<K extends keyof CarrierSaleFields>(
  value: CarrierSaleFields,
  key: K,
  fieldValue: CarrierSaleFields[K],
): CarrierSaleFields {
  return { ...value, [key]: fieldValue };
}

function TaxIdRevealControls({
  carrierId,
}: Readonly<{ carrierId: string }>) {
  const [revealedTaxId, setRevealedTaxId] = useState<string | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);

  const onReveal = async () => {
    if (revealLoading) {
      return;
    }
    setRevealLoading(true);
    setRevealError(null);
    const result = await revealCarrierTaxIdAction({ carrierId });
    setRevealLoading(false);
    if (!result.ok) {
      setRevealedTaxId(null);
      setRevealError(
        result.reason === "unauthorized"
          ? "Not authorized to reveal Tax ID."
          : "Unable to reveal Tax ID.",
      );
      return;
    }
    setRevealedTaxId(result.data);
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {revealedTaxId === null ? (
          <button
            type="button"
            onClick={() => {
              void onReveal();
            }}
            disabled={revealLoading}
            className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-[#0d120b] disabled:opacity-50"
          >
            {revealLoading ? "Revealing…" : "Reveal Tax ID"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setRevealedTaxId(null);
              setRevealError(null);
            }}
            className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-[#0d120b]"
          >
            Hide Tax ID
          </button>
        )}
      </div>
      {revealedTaxId !== null ? (
        <p className="text-[0.84rem] font-medium text-[#0d120b]">
          Full Tax ID: {revealedTaxId}
        </p>
      ) : null}
      {revealError ? (
        <p className="text-[0.82rem] font-medium text-[#a33]">{revealError}</p>
      ) : null}
    </div>
  );
}

export function CarrierSalesSheetFields({
  value,
  onChange,
  salesAgentLocked = false,
  taxIdEditMode = false,
  carrierId,
}: CarrierSalesSheetFieldsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-center text-[1.15rem] font-extrabold tracking-[0.12em] text-[#0d120b] uppercase">
          Carrier sales sheet
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block">
            <span className={adminLabelClass}>US DOT *</span>
            <input
            className={adminFieldClass}
            value={value.usDot}
            onChange={(event) =>
              onChange(setField(value, "usDot", event.target.value))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>MC *</span>
            <input
            className={adminFieldClass}
            value={value.mc}
            onChange={(event) =>
              onChange(setField(value, "mc", event.target.value))
            }
          />
          </label>
        </div>
      </div>

      <div>
        <label className="block">
          <span className={adminLabelClass}>Legal name *</span>
          <input
          className={adminFieldClass}
          value={value.legalName}
          onChange={(event) =>
            onChange(setField(value, "legalName", event.target.value))
          }
        />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block">
              <span className={adminLabelClass}>DBA</span>
              <input
              className={adminFieldClass}
              value={value.dba}
              onChange={(event) =>
                onChange(setField(value, "dba", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Business address</span>
              <input
              className={adminFieldClass}
              value={value.businessAddress}
              onChange={(event) =>
                onChange(setField(value, "businessAddress", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Owner operator driver</span>
              <input
              className={adminFieldClass}
              value={value.ownerOperatorDriver}
              onChange={(event) =>
                onChange(
                  setField(value, "ownerOperatorDriver", event.target.value),
                )
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>
                Tax ID{taxIdEditMode ? "" : " *"}
              </span>
              <input
              className={adminFieldClass}
              value={value.taxId}
              autoComplete="off"
              placeholder={taxIdEditMode ? "Leave unchanged or enter new" : undefined}
              onChange={(event) =>
                onChange(setField(value, "taxId", event.target.value))
              }
            />
            </label>
            {taxIdEditMode && carrierId ? (
              <TaxIdRevealControls key={carrierId} carrierId={carrierId} />
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block">
              <span className={adminLabelClass}>Sales agent</span>
              <input
              className={adminFieldClass}
              value={value.salesAgent}
              readOnly={salesAgentLocked}
              onChange={(event) =>
                onChange(setField(value, "salesAgent", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Business telephone</span>
              <input
              className={adminFieldClass}
              value={value.businessTelephone}
              onChange={(event) =>
                onChange(
                  setField(value, "businessTelephone", event.target.value),
                )
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Truck type</span>
              <input
              className={adminFieldClass}
              value={value.truckType}
              onChange={(event) =>
                onChange(setField(value, "truckType", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Amount *</span>
              <input
              className={adminFieldClass}
              inputMode="decimal"
              required
              value={value.amount}
              onChange={(event) =>
                onChange(setField(value, "amount", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Currency *</span>
              <select
              className={adminFieldClass}
              required
              value={value.currency}
              onChange={(event) =>
                onChange(setField(value, "currency", event.target.value))
              }
            >
              <option value="">Select currency</option>
              {saleCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block">
            <span className={adminLabelClass}>Name</span>
            <input
            className={adminFieldClass}
            value={value.contactName}
            onChange={(event) =>
              onChange(setField(value, "contactName", event.target.value))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Phone</span>
            <input
            className={adminFieldClass}
            value={value.contactPhone}
            onChange={(event) =>
              onChange(setField(value, "contactPhone", event.target.value))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Email</span>
            <input
            type="email"
            className={adminFieldClass}
            value={value.contactEmail}
            onChange={(event) =>
              onChange(setField(value, "contactEmail", event.target.value))
            }
          />
          </label>
        </div>
        <div>
          <label className="block">
            <span className={adminLabelClass}>Truck</span>
            <input
            className={adminFieldClass}
            value={value.truck}
            onChange={(event) =>
              onChange(setField(value, "truck", event.target.value))
            }
          />
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="block">
            <span className={adminLabelClass}>Trailer</span>
            <input
            className={adminFieldClass}
            value={value.trailer}
            onChange={(event) =>
              onChange(setField(value, "trailer", event.target.value))
            }
          />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[0.84rem] font-extrabold tracking-[0.14em] text-[#0d120b] uppercase">
          Insurance company details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block">
              <span className={adminLabelClass}>Name</span>
              <input
              className={adminFieldClass}
              value={value.insuranceName}
              onChange={(event) =>
                onChange(setField(value, "insuranceName", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Phone</span>
              <input
              className={adminFieldClass}
              value={value.insurancePhone}
              onChange={(event) =>
                onChange(setField(value, "insurancePhone", event.target.value))
              }
            />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block">
              <span className={adminLabelClass}>Street address</span>
              <input
              className={adminFieldClass}
              value={value.insuranceStreet}
              onChange={(event) =>
                onChange(setField(value, "insuranceStreet", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>City, state, zip</span>
              <input
              className={adminFieldClass}
              value={value.insuranceCityStateZip}
              onChange={(event) =>
                onChange(
                  setField(value, "insuranceCityStateZip", event.target.value),
                )
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Email</span>
              <input
              type="email"
              className={adminFieldClass}
              value={value.insuranceEmail}
              onChange={(event) =>
                onChange(setField(value, "insuranceEmail", event.target.value))
              }
            />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[0.84rem] font-extrabold tracking-[0.14em] text-[#0d120b] uppercase">
          Factoring company details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block">
              <span className={adminLabelClass}>Name</span>
              <input
              className={adminFieldClass}
              value={value.factoringName}
              onChange={(event) =>
                onChange(setField(value, "factoringName", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Phone</span>
              <input
              className={adminFieldClass}
              value={value.factoringPhone}
              onChange={(event) =>
                onChange(setField(value, "factoringPhone", event.target.value))
              }
            />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block">
              <span className={adminLabelClass}>Street address</span>
              <input
              className={adminFieldClass}
              value={value.factoringStreet}
              onChange={(event) =>
                onChange(setField(value, "factoringStreet", event.target.value))
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>City, state, zip</span>
              <input
              className={adminFieldClass}
              value={value.factoringCityStateZip}
              onChange={(event) =>
                onChange(
                  setField(value, "factoringCityStateZip", event.target.value),
                )
              }
            />
            </label>
          </div>
          <div>
            <label className="block">
              <span className={adminLabelClass}>Email</span>
              <input
              type="email"
              className={adminFieldClass}
              value={value.factoringEmail}
              onChange={(event) =>
                onChange(setField(value, "factoringEmail", event.target.value))
              }
            />
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block">
          <span className={adminLabelClass}>Approved by</span>
          <input
          className={adminFieldClass}
          value={value.approvedBy}
          onChange={(event) =>
            onChange(setField(value, "approvedBy", event.target.value))
          }
        />
        </label>
      </div>
    </div>
  );
}
