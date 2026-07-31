"use client";

import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import type { CarrierSaleFields } from "@/constants/sales";

type CarrierSalesSheetFieldsProps = {
  readonly value: CarrierSaleFields;
  readonly onChange: (next: CarrierSaleFields) => void;
  readonly salesAgentLocked?: boolean;
};

function setField<K extends keyof CarrierSaleFields>(
  value: CarrierSaleFields,
  key: K,
  fieldValue: CarrierSaleFields[K],
): CarrierSaleFields {
  return { ...value, [key]: fieldValue };
}

export function CarrierSalesSheetFields({
  value,
  onChange,
  salesAgentLocked = false,
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
          <label className={adminLabelClass}>US DOT</label>
          <input
            className={adminFieldClass}
            value={value.usDot}
            onChange={(event) =>
              onChange(setField(value, "usDot", event.target.value))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>MC</label>
          <input
            className={adminFieldClass}
            value={value.mc}
            onChange={(event) =>
              onChange(setField(value, "mc", event.target.value))
            }
          />
        </div>
      </div>

      <div>
        <label className={adminLabelClass}>Legal name</label>
        <input
          className={adminFieldClass}
          value={value.legalName}
          onChange={(event) =>
            onChange(setField(value, "legalName", event.target.value))
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className={adminLabelClass}>DBA</label>
            <input
              className={adminFieldClass}
              value={value.dba}
              onChange={(event) =>
                onChange(setField(value, "dba", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Business address</label>
            <input
              className={adminFieldClass}
              value={value.businessAddress}
              onChange={(event) =>
                onChange(setField(value, "businessAddress", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Owner operator driver</label>
            <input
              className={adminFieldClass}
              value={value.ownerOperatorDriver}
              onChange={(event) =>
                onChange(
                  setField(value, "ownerOperatorDriver", event.target.value),
                )
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Tax ID</label>
            <input
              className={adminFieldClass}
              value={value.taxId}
              autoComplete="off"
              onChange={(event) =>
                onChange(setField(value, "taxId", event.target.value))
              }
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={adminLabelClass}>Sales agent</label>
            <input
              className={adminFieldClass}
              value={value.salesAgent}
              readOnly={salesAgentLocked}
              onChange={(event) =>
                onChange(setField(value, "salesAgent", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Business telephone</label>
            <input
              className={adminFieldClass}
              value={value.businessTelephone}
              onChange={(event) =>
                onChange(
                  setField(value, "businessTelephone", event.target.value),
                )
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Truck type</label>
            <input
              className={adminFieldClass}
              value={value.truckType}
              onChange={(event) =>
                onChange(setField(value, "truckType", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Type</label>
            <input
              className={adminFieldClass}
              value={value.type}
              onChange={(event) =>
                onChange(setField(value, "type", event.target.value))
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={adminLabelClass}>Name</label>
          <input
            className={adminFieldClass}
            value={value.contactName}
            onChange={(event) =>
              onChange(setField(value, "contactName", event.target.value))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Phone</label>
          <input
            className={adminFieldClass}
            value={value.contactPhone}
            onChange={(event) =>
              onChange(setField(value, "contactPhone", event.target.value))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Email</label>
          <input
            type="email"
            className={adminFieldClass}
            value={value.contactEmail}
            onChange={(event) =>
              onChange(setField(value, "contactEmail", event.target.value))
            }
          />
        </div>
        <div>
          <label className={adminLabelClass}>Truck</label>
          <input
            className={adminFieldClass}
            value={value.truck}
            onChange={(event) =>
              onChange(setField(value, "truck", event.target.value))
            }
          />
        </div>
        <div className="sm:col-span-2">
          <label className={adminLabelClass}>Trailer</label>
          <input
            className={adminFieldClass}
            value={value.trailer}
            onChange={(event) =>
              onChange(setField(value, "trailer", event.target.value))
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[0.84rem] font-extrabold tracking-[0.14em] text-[#0d120b] uppercase">
          Insurance company details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={adminLabelClass}>Name</label>
            <input
              className={adminFieldClass}
              value={value.insuranceName}
              onChange={(event) =>
                onChange(setField(value, "insuranceName", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Phone</label>
            <input
              className={adminFieldClass}
              value={value.insurancePhone}
              onChange={(event) =>
                onChange(setField(value, "insurancePhone", event.target.value))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className={adminLabelClass}>Street address</label>
            <input
              className={adminFieldClass}
              value={value.insuranceStreet}
              onChange={(event) =>
                onChange(setField(value, "insuranceStreet", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>City, state, zip</label>
            <input
              className={adminFieldClass}
              value={value.insuranceCityStateZip}
              onChange={(event) =>
                onChange(
                  setField(value, "insuranceCityStateZip", event.target.value),
                )
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Email</label>
            <input
              type="email"
              className={adminFieldClass}
              value={value.insuranceEmail}
              onChange={(event) =>
                onChange(setField(value, "insuranceEmail", event.target.value))
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[0.84rem] font-extrabold tracking-[0.14em] text-[#0d120b] uppercase">
          Factoring company details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={adminLabelClass}>Name</label>
            <input
              className={adminFieldClass}
              value={value.factoringName}
              onChange={(event) =>
                onChange(setField(value, "factoringName", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Phone</label>
            <input
              className={adminFieldClass}
              value={value.factoringPhone}
              onChange={(event) =>
                onChange(setField(value, "factoringPhone", event.target.value))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className={adminLabelClass}>Street address</label>
            <input
              className={adminFieldClass}
              value={value.factoringStreet}
              onChange={(event) =>
                onChange(setField(value, "factoringStreet", event.target.value))
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>City, state, zip</label>
            <input
              className={adminFieldClass}
              value={value.factoringCityStateZip}
              onChange={(event) =>
                onChange(
                  setField(value, "factoringCityStateZip", event.target.value),
                )
              }
            />
          </div>
          <div>
            <label className={adminLabelClass}>Email</label>
            <input
              type="email"
              className={adminFieldClass}
              value={value.factoringEmail}
              onChange={(event) =>
                onChange(setField(value, "factoringEmail", event.target.value))
              }
            />
          </div>
        </div>
      </div>

      <div>
        <label className={adminLabelClass}>Approved by</label>
        <input
          className={adminFieldClass}
          value={value.approvedBy}
          onChange={(event) =>
            onChange(setField(value, "approvedBy", event.target.value))
          }
        />
      </div>
    </div>
  );
}
