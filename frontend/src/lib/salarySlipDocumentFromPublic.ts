import type { SalarySlipPublic } from "@jumpifzero/contracts";
import type { SalarySlipDocumentModel } from "@/components/salaries/SalarySlipDocument";

export function salarySlipDocumentFromPublic(
  slip: SalarySlipPublic,
  opts?: {
    readonly footer?: {
      readonly phone: string;
      readonly email: string;
      readonly locationLines: readonly string[];
    };
  },
): SalarySlipDocumentModel {
  const footer = opts?.footer;
  return {
    employeeName: slip.employeeName,
    designation: slip.designation,
    slipDate: slip.slipDate,
    salaryMonth: slip.salaryMonth,
    basicSalary: slip.basicSalary,
    punctuality: slip.punctuality,
    medicalAllowance: slip.medicalAllowance,
    incentives: slip.incentives,
    bonus: slip.bonus,
    advance: slip.advance,
    incomeTax: slip.incomeTax,
    whTax: slip.whTax,
    fuelAdvances: slip.fuelAdvances,
    totalEarnings: slip.totalEarnings,
    totalDeduction: slip.totalDeduction,
    netSalary: slip.netSalary,
    currency: slip.currency,
    status: slip.statusCode,
    company: {
      legalName: slip.fromCompany,
      email: slip.fromEmail,
      phone: slip.fromPhone,
    },
    footer: {
      phone: footer?.phone.trim() || slip.fromPhone,
      email: footer?.email.trim() || slip.fromEmail,
      locationLines: footer?.locationLines ?? [],
    },
  };
}
