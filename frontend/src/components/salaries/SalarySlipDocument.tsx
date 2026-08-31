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
  readonly unpaidDays: string;
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
    { label: "UnPaid Days", value: slip.unpaidDays },
  ] as const;

  const rowCount = Math.max(earnings.length, deductions.length);

  return (
    <article
      className="invoice-document relative mx-auto aspect-[210/297] w-full max-w-[800px] overflow-hidden border border-black/10 bg-white text-[#0d120b] shadow-[0_24px_60px_rgba(47,58,40,0.12)] print:border-black/20 print:shadow-none"
      aria-label={`Salary slip for ${slip.employeeName}`}
    >
      <div className="relative z-10 flex h-full flex-col px-[5.5%] pt-[3.8%] pb-[3.2%]">
        <header className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className={sectionLabelClass}>Salary slip</p>
            <div className="mt-2.5 flex items-center gap-3.5">
              <Image
                src="/images/jz-invoice-logo.png"
                alt={site.name}
                width={413}
                height={414}
                sizes="72px"
                priority
                quality={100}
                className="h-14 w-14 object-contain md:h-16 md:w-16"
              />
              <div>
                <h1 className="text-[1.7rem] font-extrabold tracking-[-0.02em] md:text-[1.9rem]">
                  {site.name}
                </h1>
                <p className="mt-1 text-[0.86rem] font-semibold tracking-[0.04em] text-black/45 uppercase">
                  {site.tagline}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[0.92rem] font-medium text-black/55">
            <p>Date: {formatDate(slip.slipDate)}</p>
            <p className="mt-1.5">{slip.salaryMonth}</p>
            <p className="mt-1.5 capitalize">{slip.status}</p>
          </div>
        </header>

        <div className="mt-5 grid shrink-0 gap-3 border-y border-black/10 py-4 text-[1rem] sm:grid-cols-2">
          <p>
            <span className="font-bold">Employee Name:</span> {slip.employeeName}
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

        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden border border-black">
          <div className="grid shrink-0 grid-cols-4 bg-black text-[0.95rem] text-white">
            <div className="border-r border-white/20 px-3 py-3 text-left font-extrabold">
              Earnings
            </div>
            <div className="border-r border-white/20 px-3 py-3 text-right font-extrabold">
              Amount
            </div>
            <div className="border-r border-white/20 px-3 py-3 text-left font-extrabold">
              Deduction
            </div>
            <div className="px-3 py-3 text-right font-extrabold">Amount</div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {Array.from({ length: rowCount }, (_, index) => {
              const earning = earnings[index];
              const deduction = deductions[index];
              return (
                <div
                  key={`row-${index}`}
                  className="grid min-h-0 flex-1 grid-cols-4 border-t border-black text-[0.98rem]"
                >
                  <div className="flex items-center border-r border-black px-3 py-2">
                    {earning?.label ?? ""}
                  </div>
                  <div className="flex items-center justify-end border-r border-black px-3 py-2 tabular-nums font-semibold">
                    {earning ? money(earning.value) : ""}
                  </div>
                  <div className="flex items-center border-r border-black px-3 py-2">
                    {deduction?.label ?? ""}
                  </div>
                  <div className="flex items-center justify-end px-3 py-2 tabular-nums font-semibold">
                    {deduction ? money(deduction.value) : ""}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid shrink-0 grid-cols-4 border-t border-black bg-[#e8e8e8] text-[0.98rem]">
            <div className="border-r border-black px-3 py-3 font-extrabold">
              Total Earnings
            </div>
            <div className="border-r border-black px-3 py-3 text-right tabular-nums font-extrabold">
              {money(slip.totalEarnings)}
            </div>
            <div className="border-r border-black px-3 py-3 font-extrabold">
              Total Deduction
            </div>
            <div className="px-3 py-3 text-right tabular-nums font-extrabold">
              {money(slip.totalDeduction)}
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-4 border-t border-black bg-black text-[1.12rem] text-white">
            <div className="col-span-3 border-r border-white/20 px-3 py-4 font-extrabold">
              Net Salary
            </div>
            <div className="px-3 py-4 text-right tabular-nums font-extrabold">
              {money(slip.netSalary)}
            </div>
          </div>
        </div>

        <div className="mt-8 grid shrink-0 gap-10 sm:grid-cols-2">
          <div>
            <p className="text-[0.92rem] font-semibold">Employ Signature:</p>
            <div className="mt-12 border-b border-black/35" />
          </div>
          <div>
            <p className="text-[0.92rem] font-semibold">Authorised Signatory:</p>
            <div className="mt-12 border-b border-black/35" />
          </div>
        </div>

        <p className="mt-6 shrink-0 text-[0.8rem] font-medium text-black/45">
          {disclaimer}
        </p>

        <footer className="mt-5 grid shrink-0 grid-cols-1 gap-3 border-t border-black/10 pt-4 text-[0.84rem] font-extrabold leading-[1.35] text-black/55 sm:grid-cols-3 sm:items-end sm:gap-3">
          <p>Phone: {footerPhone}</p>
          <p className="sm:text-center">Email: {footerEmail}</p>
          <div className="sm:text-right">
            <p>Location: {footerLocationLines[0]}</p>
            {footerLocationLines.slice(1).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}
