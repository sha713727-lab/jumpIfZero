import Link from "next/link";

export type ServiceBreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

export function ServiceBreadcrumbs({
  items,
}: {
  readonly items: readonly ServiceBreadcrumbItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-[0.78rem] font-semibold text-cream/55">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={item.href ?? `crumb-${index}-${item.label}`}
              className="inline-flex items-center gap-2"
            >
              {index > 0 ? (
                <span aria-hidden="true" className="text-cream/35">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-cream/85" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
