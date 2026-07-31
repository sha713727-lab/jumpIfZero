export const saleStatuses = ["draft", "quoted", "won", "lost"] as const;

export const saleStatusLabel: Record<(typeof saleStatuses)[number], string> = {
  draft: "Draft",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "closed",
] as const;

export const leadStatusLabel: Record<(typeof leadStatuses)[number], string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  closed: "Closed",
};

export const employeeKindLabel = {
  delivery: "Delivery",
  sales: "Sales",
} as const;

export type CarrierSaleFields = {
  usDot: string;
  mc: string;
  legalName: string;
  dba: string;
  businessAddress: string;
  ownerOperatorDriver: string;
  taxId: string;
  salesAgent: string;
  businessTelephone: string;
  truckType: string;
  type: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  truck: string;
  trailer: string;
  insuranceName: string;
  insurancePhone: string;
  insuranceStreet: string;
  insuranceCityStateZip: string;
  insuranceEmail: string;
  factoringName: string;
  factoringPhone: string;
  factoringStreet: string;
  factoringCityStateZip: string;
  factoringEmail: string;
  approvedBy: string;
};

export const emptyCarrierSaleFields: CarrierSaleFields = {
  usDot: "",
  mc: "",
  legalName: "",
  dba: "",
  businessAddress: "",
  ownerOperatorDriver: "",
  taxId: "",
  salesAgent: "",
  businessTelephone: "",
  truckType: "",
  type: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  truck: "",
  trailer: "",
  insuranceName: "",
  insurancePhone: "",
  insuranceStreet: "",
  insuranceCityStateZip: "",
  insuranceEmail: "",
  factoringName: "",
  factoringPhone: "",
  factoringStreet: "",
  factoringCityStateZip: "",
  factoringEmail: "",
  approvedBy: "",
};

export function maskTaxId(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= 4) {
    return "••••";
  }

  return `••••${trimmed.slice(-4)}`;
}
