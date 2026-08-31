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

  return (
    <article
      className="invoice-document relative mx-auto aspect-[210/297] w-full max-w-[800px] overflow-hidden border border-black/10 bg-white text-[#0d120b] shadow-[0_24px_60px_rgba(47,58,40,0.12)] print:border-black/20 print:shadow-none"
      aria-label={`Salary slip for ${slip.employeeName}`}
    >
      <div className="relative z-10 flex h-full flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 bg-black px-[5.5%] pt-[4%] pb-5 text-white">
          <div>
            <p className="text-[0.78rem] font-extrabold tracking-[0.12em] text-white/75 uppercase">
              Salary slip
            </p>
            <div className="mt-3 flex items-center gap-3.5">
              <Image
                src="/images/jz-invoice-logo.png"
                alt={site.name}
                width={413}
                height={414}
                sizes="72px"
                priority
                quality={100}
                className="h-14 w-14 object-contain brightness-0 invert md:h-[3.75rem] md:w-[3.75rem]"
              />
              <div>
                <h1 className="text-[1.75rem] font-extrabold tracking-[-0.02em] text-white md:text-[1.95rem]">
                  {site.name}
                </h1>
                <p className="mt-1 text-[0.88rem] font-semibold tracking-[0.04em] text-white/70 uppercase">
                  {site.tagline}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[0.95rem] font-medium text-white/80">
            <p>Date: {formatDate(slip.slipDate)}</p>
            <p className="mt-1.5">{slip.salaryMonth}</p>
            <p className="mt-1.5 capitalize">{slip.status}</p>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-[5.5%] pt-6 pb-[3.4%]">
          <div className="grid shrink-0 gap-3.5 border-y border-black/10 py-5 text-[1rem] sm:grid-cols-2">
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
              <span className="font-bold">Date:</span>{" "}
              {formatDate(slip.slipDate)}
            </p>
          </div>

          <table className="mt-6 w-full shrink-0 border-collapse text-[0.98rem]">
            <thead>
              <tr className="bg-black text-white">
                <th className="border border-black px-3.5 py-3 text-left font-extrabold">
                  Earnings
                </th>
                <th className="border border-black px-3.5 py-3 text-right font-extrabold">
                  Amount
                </th>
                <th className="border border-black px-3.5 py-3 text-left font-extrabold">
                  Deduction
                </th>
                <th className="border border-black px-3.5 py-3 text-right font-extrabold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from(
                {
                  length: Math.max(earnings.length, deductions.length),
                },
                (_, index) => {
                  const earning = earnings[index];
                  const deduction = deductions[index];
                  return (
                    <tr key={`row-${index}`}>
                      <td className="border border-black px-3.5 py-3.5">
                        {earning?.label ?? ""}
                      </td>
                      <td className="border border-black px-3.5 py-3.5 text-right tabular-nums font-semibold">
                        {earning ? money(earning.value) : ""}
                      </td>
                      <td className="border border-black px-3.5 py-3.5">
                        {deduction?.label ?? ""}
                      </td>
                      <td className="border border-black px-3.5 py-3.5 text-right tabular-nums font-semibold">
                        {deduction ? money(deduction.value) : ""}
                      </td>
                    </tr>
                  );
                },
              )}
              <tr className="bg-[#e8e8e8]">
                <td className="border border-black px-3.5 py-3.5 font-extrabold">
                  Total Earnings
                </td>
                <td className="border border-black px-3.5 py-3.5 text-right tabular-nums font-extrabold">
                  {money(slip.totalEarnings)}
                </td>
                <td className="border border-black px-3.5 py-3.5 font-extrabold">
                  Total Deduction
                </td>
                <td className="border border-black px-3.5 py-3.5 text-right tabular-nums font-extrabold">
                  {money(slip.totalDeduction)}
                </td>
              </tr>
              <tr className="bg-black text-white">
                <td
                  colSpan={3}
                  className="border border-black px-3.5 py-4 text-[1.1rem] font-extrabold"
                >
                  Net Salary
                </td>
                <td className="border border-black px-3.5 py-4 text-right text-[1.1rem] font-extrabold tabular-nums">
                  {money(slip.netSalary)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-auto grid shrink-0 gap-12 pt-14 sm:grid-cols-2">
            <div>
              <p className="text-[0.95rem] font-semibold">Employ Signature:</p>
              <div className="mt-16 border-b border-black/40" />
            </div>
            <div>
              <p className="text-[0.95rem] font-semibold">
                Authorised Signatory:
              </p>
              <div className="mt-16 border-b border-black/40" />
            </div>
          </div>

          <p className="mt-8 shrink-0 text-[0.8rem] font-medium text-black/45">
            {disclaimer}
          </p>
        </div>

        <footer className="grid shrink-0 grid-cols-1 gap-3 bg-black px-[5.5%] py-4 text-[0.84rem] font-extrabold leading-[1.35] text-white sm:grid-cols-3 sm:items-end sm:gap-3">
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
