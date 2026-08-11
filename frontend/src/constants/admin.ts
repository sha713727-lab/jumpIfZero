export type AdminNavId =
  | "overview"
  | "clients"
  | "projects"
  | "messages"
  | "invoices"
  | "salaries"
  | "files"
  | "services"
  | "portfolio"
  | "blog"
  | "team"
  | "siteSections"
  | "faqs"
  | "contact"
  | "callbacks"
  | "employees"
  | "sales"
  | "salesLeads"
  | "security";

export type AdminNavItem = {
  readonly id: AdminNavId;
  readonly name: string;
  readonly href: string;
};

export type AdminNavGroup = {
  readonly id: string;
  readonly label?: string;
  readonly items: readonly AdminNavItem[];
};

export const adminNavGroups: readonly AdminNavGroup[] = [
  {
    id: "home",
    items: [{ id: "overview", name: "Overview", href: "/admin" }],
  },
  {
    id: "ops",
    label: "Operations",
    items: [
      { id: "clients", name: "Clients", href: "/admin/clients" },
      { id: "projects", name: "Projects", href: "/admin/projects" },
      { id: "messages", name: "Messages", href: "/admin/messages" },
      { id: "invoices", name: "Invoices", href: "/admin/invoices" },
      { id: "salaries", name: "Salaries", href: "/admin/salaries" },
      { id: "files", name: "Files", href: "/admin/files" },
    ],
  },
  {
    id: "cms",
    label: "Site",
    items: [
      { id: "services", name: "Services", href: "/admin/services" },
      { id: "portfolio", name: "Portfolio", href: "/admin/portfolio" },
      { id: "blog", name: "Blog", href: "/admin/blog" },
      { id: "team", name: "Team", href: "/admin/team" },
      { id: "siteSections", name: "Site sections", href: "/admin/site-sections" },
      { id: "faqs", name: "FAQs", href: "/admin/faqs" },
      { id: "contact", name: "Contact", href: "/admin/contact" },
      { id: "callbacks", name: "Callbacks", href: "/admin/callbacks" },
    ],
  },
  {
    id: "people",
    label: "Workforce",
    items: [
      { id: "employees", name: "Employees", href: "/admin/employees" },
      { id: "sales", name: "Sales", href: "/admin/sales" },
      { id: "salesLeads", name: "Sales leads", href: "/admin/sales-leads" },
      { id: "security", name: "Security", href: "/admin/security" },
    ],
  },
] as const;

export const adminOverviewCopy = {
  welcome: "Welcome back",
  lede: "Live catalog, clients, and delivery status for JZ Enterprises.",
  signOut: "Sign out",
  recentTitle: "Recent activity",
  recentLink: "Open projects",
  recentHref: "/admin/projects" as const,
  coverageTitle: "Delivery overview",
  coverageLede: "How work moves from request to launch.",
  mixTitle: "Catalog mix",
  mixLede: "Share of active content across the public site.",
  statusTitle: "System status",
  statusLabel: "DATABASE",
  statusValue: "Up",
  statusLede: "Catalog and client records are loaded from the database.",
  servicesLive: "Live from database",
  faqsLive: "Live from database",
} as const;

export const adminEmptyCopy = {
  sales: "No sales yet.",
  leads: "No leads yet.",
  clientProjects: "No projects for this client yet.",
  clientFiles: "No files for this client yet.",
  clientInvoices: "No invoices for this client yet.",
  clientMessages: "No messages for this client yet.",
  clientTeam: "No delivery employees to assign.",
  clientEmployeesAssigned: "No employees assigned yet.",
  clientRecentProjects: "No projects for this client yet.",
  viewAllProjects: "View all projects",
} as const;

export const projectStatuses = [
  "requested",
  "approved",
  "in_progress",
  "completed",
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export const projectStatusLabel: Record<ProjectStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  in_progress: "In progress",
  completed: "Completed",
};
