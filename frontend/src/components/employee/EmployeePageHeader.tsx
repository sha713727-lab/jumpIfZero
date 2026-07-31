import { employeeIcons } from "@/components/employee/EmployeeIcons";

type EmployeePageHeaderProps = {
  readonly title: string;
  readonly lede: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
};

export function EmployeePageHeader({
  title,
  lede,
  actionLabel,
  onAction,
}: EmployeePageHeaderProps) {
  const PlusIcon = employeeIcons.plus;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          {title}
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">{lede}</p>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream transition-colors hover:bg-[#2f3a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <PlusIcon className="size-4" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
