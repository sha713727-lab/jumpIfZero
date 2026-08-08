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

export const saleCurrencies = ["USD", "PKR"] as const;

export function normalizeSaleAmount(value: string): string {
  return value.replace(/[^\d.]/g, "");
}

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
  amount: string;
  currency: string;
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
  amount: "",
  currency: "USD",
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

export function saleSheetValidationMessage(
  fields: CarrierSaleFields,
  isCreate: boolean,
): string | null {
  if (!fields.usDot.trim()) {
    return "US DOT is required.";
  }
  if (!fields.mc.trim()) {
    return "MC is required.";
  }
  if (!fields.legalName.trim()) {
    return "Legal name is required.";
  }
  if (isCreate && !fields.taxId.trim()) {
    return "Tax ID is required.";
  }
  const amount = normalizeSaleAmount(fields.amount);
  if (amount.length === 0 || Number(amount) <= 0) {
    return "Enter an amount greater than 0.";
  }
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return "Amount must be a valid number (up to 2 decimal places).";
  }
  if (fields.currency.trim().length !== 3) {
    return "Select a currency.";
  }
  return null;
}

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
