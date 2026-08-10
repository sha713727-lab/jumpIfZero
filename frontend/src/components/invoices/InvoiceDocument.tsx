import Image from "next/image";
import { site } from "@/constants/site";

export type InvoiceDocumentModel = {
  readonly number: string;
  readonly title: string;
  readonly amount: string;
  readonly currency: string;
  readonly status: "draft" | "sent" | "paid";
  readonly issuedOn: string | null;
  readonly dueDate: string | null;
  readonly createdAt: string;
  readonly company: {
    readonly legalName: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly client: {
    readonly company: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly location: string;
  };
  readonly footer: {
    readonly phone: string;
    readonly email: string;
    readonly locationLines: readonly string[];
  };
};

const statusLabel: Record<InvoiceDocumentModel["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
};

function formatMoney(amount: string, currency: string): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return `${currency} ${amount}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.length === 3 ? currency : "USD",
  }).format(numeric);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type InvoiceDocumentProps = {
  readonly invoice: InvoiceDocumentModel;
};

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const issued = invoice.issuedOn ?? invoice.createdAt.slice(0, 10);
  const total = formatMoney(invoice.amount, invoice.currency);
  const brandName = invoice.company.legalName || site.name;
  const footerPhone = invoice.footer.phone.trim() || "—";
  const footerEmail = invoice.footer.email.trim() || "—";
  const footerLocationLines =
    invoice.footer.locationLines.length > 0
      ? invoice.footer.locationLines
      : ["—"];

  return (
    <article
      className="invoice-document relative mx-auto aspect-[2480/3508] w-full max-w-[800px] overflow-hidden bg-[#74845C] text-[#1a140c] shadow-[0_24px_60px_rgba(47,58,40,0.22)]"
      aria-label={`Invoice ${invoice.number}`}
    >
      <div
        className="pointer-events-none absolute top-[13.5%] right-[4.2%] bottom-[1.6%] left-0 rounded-tr-[52%] bg-gradient-to-b from-[#fedc5a] to-[#f57828]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[1.6%] left-0 h-[6.2%] w-[3.2%] rounded-tr-[0.9rem] bg-[#74845C]"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 px-[4.5%] pt-[3.6%] pr-[5.5%] pb-[2.8%]">
          <div className="flex items-center gap-3.5">
            <Image
              src="/images/jz-invoice-logo.png"
              alt={brandName}
              width={413}
              height={414}
              sizes="64px"
              priority
              quality={100}
              className="h-12 w-12 object-contain md:h-[3.35rem] md:w-[3.35rem]"
            />
            <div>
              <p className="text-[1.08rem] font-extrabold tracking-[0.05em] text-white uppercase md:text-[1.32rem]">
                {brandName}
              </p>
              <p className="mt-0.5 text-[0.7rem] font-semibold tracking-[0.22em] text-white uppercase md:text-[0.78rem]">
                {site.tagline}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-extrabold tracking-[0.18em] text-white/70 uppercase">
              Invoice
            </p>
            <p className="mt-1 text-[1.1rem] font-extrabold tracking-[-0.02em] text-white md:text-[1.25rem]">
              {invoice.number}
            </p>
            <p className="mt-1.5 inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-[0.68rem] font-bold text-white">
              {statusLabel[invoice.status]}
            </p>
          </div>
        </header>

        <div className="flex flex-1 flex-col pl-[5.5%] pr-[28%] pt-[5%] pb-[2%]">
          <div className="grid max-w-[34rem] gap-8 sm:grid-cols-2 sm:gap-10">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-extrabold tracking-[0.16em] text-[#5c3d18]/75 uppercase">
                Bill to
              </p>
              <p className="mt-2.5 text-[1rem] font-extrabold tracking-[-0.02em]">
                {invoice.client.company || invoice.client.name}
              </p>
              {invoice.client.name && invoice.client.company ? (
                <p className="mt-1 text-[0.86rem] font-medium text-[#1a140c]/72">
                  {invoice.client.name}
                </p>
              ) : null}
              {invoice.client.email ? (
                <p className="mt-1 break-all text-[0.84rem] font-medium text-[#1a140c]/65">
                  {invoice.client.email}
                </p>
              ) : null}
              {invoice.client.phone ? (
                <p className="text-[0.84rem] font-medium text-[#1a140c]/65">
                  {invoice.client.phone}
                </p>
              ) : null}
              {invoice.client.location ? (
                <p className="text-[0.84rem] font-medium text-[#1a140c]/65">
                  {invoice.client.location}
                </p>
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-extrabold tracking-[0.16em] text-[#5c3d18]/75 uppercase">
                From
              </p>
              <p className="mt-2.5 text-[1rem] font-extrabold tracking-[-0.02em]">
                {invoice.company.legalName}
              </p>
              <p className="mt-1 break-all text-[0.84rem] font-medium text-[#1a140c]/65">
                {invoice.company.email}
              </p>
              <p className="text-[0.84rem] font-medium text-[#1a140c]/65">
                {invoice.company.phone}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[0.8rem]">
                <div>
                  <dt className="font-bold tracking-[0.08em] text-[#5c3d18]/65 uppercase">
                    Issued
                  </dt>
                  <dd className="mt-1 font-semibold">{formatDate(issued)}</dd>
                </div>
                <div>
                  <dt className="font-bold tracking-[0.08em] text-[#5c3d18]/65 uppercase">
                    Due
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {formatDate(invoice.dueDate)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 max-w-[34rem]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#1a140c]/22">
                  <th className="pb-2.5 text-[0.65rem] font-extrabold tracking-[0.14em] text-[#5c3d18]/75 uppercase">
                    Description
                  </th>
                  <th className="w-[7.5rem] pb-2.5 text-right text-[0.65rem] font-extrabold tracking-[0.14em] text-[#5c3d18]/75 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#1a140c]/12">
                  <td className="py-4 align-top">
                    <p className="text-[0.94rem] font-semibold">{invoice.title}</p>
                    <p className="mt-1 text-[0.78rem] font-medium text-[#1a140c]/55">
                      Professional services
                    </p>
                  </td>
                  <td className="w-[7.5rem] py-4 align-top text-right text-[0.94rem] font-semibold">
                    {total}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-[14rem] space-y-2">
                <div className="flex items-center justify-between text-[0.86rem]">
                  <span className="font-medium text-[#1a140c]/55">Subtotal</span>
                  <span className="font-semibold">{total}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#1a140c]/18 pt-2.5 text-[1rem]">
                  <span className="font-extrabold tracking-[-0.02em]">
                    Amount due
                  </span>
                  <span className="font-extrabold text-[#5c3d18]">{total}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto max-w-[34rem] pt-8">
            <p className="text-[0.65rem] font-extrabold tracking-[0.16em] text-[#5c3d18]/75 uppercase">
              Authorized signature &amp; stamp
            </p>
            <div className="mt-3 inline-flex items-end gap-3">
              <div>
                <div className="flex h-[4.5rem] max-w-[11rem] items-end">
                  <Image
                    src="/images/jz-authorized-signature.png"
                    alt="Authorized signature"
                    width={548}
                    height={400}
                    className="h-[4rem] w-auto max-w-[11rem] object-contain object-left"
                  />
                </div>
                <div className="mt-2 max-w-[11rem] border-b border-[#1a140c]/40" />
                <p className="mt-2.5 text-[0.84rem] font-semibold">{brandName}</p>
                <p className="text-[0.74rem] font-medium text-[#1a140c]/55">
                  Authorized representative
                </p>
              </div>
              <div className="mb-6 flex h-[4.5rem] items-end">
                <Image
                  src="/images/jz-enterprises-stamp.png"
                  alt="JZ Enterprises stamp"
                  width={798}
                  height={185}
                  className="h-auto w-[9.5rem] object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="grid grid-cols-3 items-end gap-3 px-[5.5%] pt-[2.8%] pb-[2.4%] pr-[12%] text-[0.7rem] font-bold leading-[1.35] text-[#1a140c]">
          <p>Phone: {footerPhone}</p>
          <p className="text-center">Email: {footerEmail}</p>
          <div className="text-right">
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
