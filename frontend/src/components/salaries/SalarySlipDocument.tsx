import Image from "next/image";
import { site } from "@/constants/site";

export type SalarySlipDocumentModel = {
  readonly employeeName: string;
  readonly designation: string;
  readonly slipDate: string;
  readonly salaryMonth: string;
  readonly basicSalary: string;
  readonly punctuality: string;
  readonly medicalAllowance: string;
  readonly incentives: string;
  readonly bonus: string;
  readonly advance: string;
  readonly incomeTax: string;
  readonly whTax: string;
  readonly fuelAdvances: string;
  readonly totalEarnings: string;
  readonly totalDeduction: string;
  readonly netSalary: string;
  readonly currency: string;
  readonly status: "draft" | "issued";
  readonly company: {
    readonly legalName: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly footer: {
    readonly phone: string;
    readonly email: string;
    readonly locationLines: readonly string[];
  };
};

function formatMoney(amount: string, currency: string): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return `${currency} ${amount}`;
  }
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: currency.length === 3 ? currency : "PKR",
    maximumFractionDigits: 2,
  }).format(numeric);
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const sectionLabelClass =
  "text-[0.72rem] font-extrabold tracking-[0.12em] text-[#5c3d18] uppercase";

const disclaimer =
  "This is a system-generated salary slip and is valid without a physical signature.";

type SalarySlipDocumentProps = {
  readonly slip: SalarySlipDocumentModel;
};

export function SalarySlipDocument({ slip }: SalarySlipDocumentProps) {
  const brandName = slip.company.legalName || site.name;
  const money = (value: string) => formatMoney(value, slip.currency);
  const footerPhone = slip.footer.phone.trim() || "—";
  const footerEmail = slip.footer.email.trim() || "—";
  const footerLocationLines =
    slip.footer.locationLines.length > 0
      ? slip.footer.locationLines
      : ["—"];

  const earnings = [
    { label: "Basic Salary", value: slip.basicSalary },
    { label: "Punctuality", value: slip.punctuality },
    { label: "Medical Allowance", value: slip.medicalAllowance },
    { label: "Incentives", value: slip.incentives },
    { label: "Bonus", value: slip.bonus },
  ] as const;

  const deductions = [
    { label: "Advance", value: slip.advance },
    { label: "Income Tax", value: slip.incomeTax },
    { label: "W.H. Tax", value: slip.whTax },
    { label: "Fuel Advances", value: slip.fuelAdvances },
  ] as const;

  return (
    <article className="mx-auto w-full max-w-[760px] bg-white text-[#0d120b]">
      <div className="relative overflow-hidden border border-black/10 bg-white print:border-black/20">
        <div className="relative h-[88px] w-full overflow-hidden bg-[#f7f5f0]">
          <Image
            src="/images/jz-invoice-letterhead.png"
            alt=""
            fill
            unoptimized
            className="object-cover object-left"
            sizes="760px"
            priority
          />
        </div>

        <div className="px-8 pb-8 pt-6 md:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={sectionLabelClass}>Salary slip</p>
              <h1 className="mt-1 text-[1.55rem] font-extrabold tracking-[-0.02em]">
                {brandName}
              </h1>
              <p className="mt-1 text-[0.84rem] font-medium text-black/50">
                {slip.salaryMonth}
              </p>
            </div>
            <div className="text-right text-[0.84rem] font-medium text-black/55">
              <p>Date: {formatDate(slip.slipDate)}</p>
              <p className="mt-1 capitalize">{slip.status}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 border-y border-black/10 py-4 text-[0.9rem] sm:grid-cols-2">
            <p>
              <span className="font-bold">Employee Name:</span>{" "}
              {slip.employeeName}
            </p>
            <p>
              <span className="font-bold">Designation:</span>{" "}
              {slip.designation || "—"}
            </p>
            <p>
              <span className="font-bold">Salary Month:</span> {slip.salaryMonth}
            </p>
            <p>
              <span className="font-bold">Date:</span> {formatDate(slip.slipDate)}
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 grid grid-cols-[1fr_auto] gap-3 border-b border-black/12 pb-2 text-[0.72rem] font-extrabold tracking-[0.08em] text-[#5c3d18] uppercase">
                <span>Earnings</span>
                <span>Amount</span>
              </div>
              <ul className="space-y-2 text-[0.9rem]">
                {earnings.map((row) => (
                  <li
                    key={row.label}
                    className="grid grid-cols-[1fr_auto] gap-3"
                  >
                    <span>{row.label}</span>
                    <span className="font-semibold tabular-nums">
                      {money(row.value)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 border-t border-black/12 pt-3 text-[0.95rem] font-extrabold">
                <span>Total Earnings</span>
                <span className="tabular-nums">{money(slip.totalEarnings)}</span>
              </div>
            </div>

            <div>
              <div className="mb-2 grid grid-cols-[1fr_auto] gap-3 border-b border-black/12 pb-2 text-[0.72rem] font-extrabold tracking-[0.08em] text-[#5c3d18] uppercase">
                <span>Deduction</span>
                <span>Amount</span>
              </div>
              <ul className="space-y-2 text-[0.9rem]">
                {deductions.map((row) => (
                  <li
                    key={row.label}
                    className="grid grid-cols-[1fr_auto] gap-3"
                  >
                    <span>{row.label}</span>
                    <span className="font-semibold tabular-nums">
                      {money(row.value)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 border-t border-black/12 pt-3 text-[0.95rem] font-extrabold">
                <span>Total Deduction</span>
                <span className="tabular-nums">
                  {money(slip.totalDeduction)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-[rgba(92,104,73,0.12)] px-4 py-3">
            <span className="text-[0.95rem] font-extrabold tracking-[0.04em] uppercase">
              Net Salary
            </span>
            <span className="text-[1.15rem] font-extrabold tabular-nums">
              {money(slip.netSalary)}
            </span>
          </div>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-[0.84rem] font-semibold">Employ Signature:</p>
              <div className="mt-8 border-b border-black/30" />
            </div>
            <div>
              <p className="text-[0.84rem] font-semibold">
                Authorised Signatory:
              </p>
              <div className="mt-8 border-b border-black/30" />
            </div>
          </div>

          <p className="mt-8 text-[0.75rem] font-medium text-black/45">
            {disclaimer}
          </p>

          <div className="mt-6 border-t border-black/10 pt-4 text-[0.78rem] font-medium text-black/50">
            <p>{footerPhone}</p>
            <p>{footerEmail}</p>
            {footerLocationLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
