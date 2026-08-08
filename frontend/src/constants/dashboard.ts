export const dashboardNav = [
  { name: "Overview", href: "/dashboard", id: "overview" },
  { name: "Projects", href: "/dashboard/projects", id: "projects" },
  { name: "Invoices", href: "/dashboard/invoices", id: "invoices" },
  { name: "Messages", href: "/dashboard/messages", id: "messages" },
  { name: "Files", href: "/dashboard/files", id: "files" },
  { name: "Support", href: "/dashboard/support", id: "support" },
  { name: "Profile", href: "/dashboard/profile", id: "profile" },
] as const;

export type DashboardNavId = (typeof dashboardNav)[number]["id"];

export const overviewCopy = {
  welcome: "Welcome back",
  lede: "Your projects, invoices, and deliverables — in one place.",
  signOut: "Sign out",
  recentTitle: "Recent activity",
  recentLink: "View projects",
  recentHref: "/dashboard/projects" as const,
  coverageTitle: "Delivery progress",
  coverageLede: "How your engagements move from kickoff to launch.",
  mixTitle: "Engagement mix",
  mixLede: "Share of active work across your account.",
  emptyActivity: "No recent activity yet.",
} as const;

export const dashboardEmptyCopy = {
  projects: "No projects yet.",
  files: "No files yet.",
  invoices: "No invoices yet.",
  messages: "No messages yet.",
} as const;

export const supportCopy = {
  title: "Support",
  lede: "Raise a request or browse quick answers for your account.",
  cta: "Send request",
  sending: "Sending…",
  success: "Request sent. Our team will reply in Messages.",
  subjects: [
    "Project question",
    "Billing",
    "File access",
    "Urgent issue",
  ] as const,
  faqs: [
    {
      q: "How do I download project files?",
      a: "Open Files, then use Download on any deliverable shared to your account.",
    },
    {
      q: "Where do I pay an invoice?",
      a: "Open Invoices to review open balances. Contact us in Messages for payment options.",
    },
    {
      q: "Who is my account lead?",
      a: "Message your JZ account team from the Messages tab anytime.",
    },
  ],
} as const;

export const profileCopy = {
  title: "Profile",
  lede: "Keep your company and contact details current.",
  save: "Save changes",
  saving: "Saving…",
  saved: "Profile updated.",
} as const;
