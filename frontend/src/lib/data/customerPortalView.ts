import type {
  CustomerActivity,
  CustomerFile,
  CustomerInvoice,
  CustomerMessage,
  CustomerMetric,
  CustomerProject,
} from "@/lib/data/customerPortalTypes";

export function buildCustomerMetrics(input: {
  readonly projects: readonly CustomerProject[];
  readonly invoices: readonly CustomerInvoice[];
  readonly messages: readonly CustomerMessage[];
  readonly files: readonly CustomerFile[];
}): readonly CustomerMetric[] {
  const activeProjects = input.projects.filter(
    (project) => project.status !== "Completed",
  ).length;
  const openInvoices = input.invoices.filter(
    (invoice) => invoice.status !== "Paid",
  ).length;
  const unreadMessages = input.messages.filter(
    (message) => message.unread,
  ).length;
  const upcomingMilestones = input.projects.filter(
    (project) => project.nextMilestone !== "—",
  ).length;

  return [
    {
      id: "projects",
      label: "Active projects",
      value: activeProjects,
      detail:
        activeProjects === 1
          ? "1 in progress"
          : `${activeProjects} in progress`,
      tone: "brand",
    },
    {
      id: "invoices",
      label: "Open invoices",
      value: openInvoices,
      detail:
        openInvoices === 1 ? "1 open balance" : `${openInvoices} open balances`,
      tone: "secondary",
    },
    {
      id: "messages",
      label: "Unread messages",
      value: unreadMessages,
      detail: "From your team",
      tone: "dark",
    },
    {
      id: "files",
      label: "Shared files",
      value: input.files.length,
      detail: "In your library",
      tone: "brand",
    },
    {
      id: "milestones",
      label: "Milestones",
      value: upcomingMilestones,
      detail: "Tracked on projects",
      tone: "secondary",
    },
  ];
}

export function buildRecentActivity(input: {
  readonly projects: readonly CustomerProject[];
  readonly invoices: readonly CustomerInvoice[];
  readonly messages: readonly CustomerMessage[];
}): readonly CustomerActivity[] {
  type Candidate = {
    readonly at: number;
    readonly item: CustomerActivity;
  };

  const candidates: Candidate[] = [];

  for (const message of input.messages) {
    candidates.push({
      at: new Date(message.createdAt).getTime(),
      item: {
        id: `msg_${message.id}`,
        title: message.preview.slice(0, 80),
        meta: `Message · ${message.time}`,
        href: "/dashboard/messages",
      },
    });
  }

  for (const project of input.projects) {
    candidates.push({
      at: new Date(project.updatedAt).getTime(),
      item: {
        id: `prj_${project.id}`,
        title: project.name,
        meta: `Project · ${project.updated}`,
        href: "/dashboard/projects",
      },
    });
  }

  for (const invoice of input.invoices) {
    candidates.push({
      at: invoice.issuedOn === null ? 0 : new Date(invoice.issuedOn).getTime(),
      item: {
        id: `inv_${invoice.id}`,
        title: `${invoice.number} — ${invoice.title}`,
        meta: `Billing · ${invoice.issued}`,
        href: "/dashboard/invoices",
      },
    });
  }

  return candidates
    .sort((left, right) => right.at - left.at)
    .slice(0, 5)
    .map((candidate) => candidate.item);
}
