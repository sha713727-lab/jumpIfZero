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
} as const;

export const overviewMetrics = [
  {
    id: "projects",
    label: "Active projects",
    value: 3,
    detail: "3 in progress",
    tone: "brand" as const,
  },
  {
    id: "invoices",
    label: "Open invoices",
    value: 2,
    detail: "1 due this week",
    tone: "secondary" as const,
  },
  {
    id: "messages",
    label: "Unread messages",
    value: 4,
    detail: "From your team",
    tone: "dark" as const,
  },
  {
    id: "files",
    label: "New files",
    value: 6,
    detail: "Shared this month",
    tone: "brand" as const,
  },
  {
    id: "milestones",
    label: "Milestones",
    value: 2,
    detail: "Due in 14 days",
    tone: "secondary" as const,
  },
] as const;

export const recentActivity = [
  {
    id: "act_1",
    title: "Homepage redesign — design review ready",
    meta: "Project · 2 hours ago",
    href: "/dashboard/projects" as const,
  },
  {
    id: "act_2",
    title: "Invoice INV-1048 issued",
    meta: "Billing · Yesterday",
    href: "/dashboard/invoices" as const,
  },
  {
    id: "act_3",
    title: "Brand guidelines PDF uploaded",
    meta: "Files · 2 days ago",
    href: "/dashboard/files" as const,
  },
] as const;

export const progressSeries = [
  { label: "Kickoff", value: 8 },
  { label: "Design", value: 16 },
  { label: "Build", value: 24 },
  { label: "Launch", value: 31 },
] as const;

export const engagementMix = [
  { label: "Website", value: 9, percent: 29, color: "#74815f" },
  { label: "App", value: 6, percent: 19, color: "#2f3a28" },
  { label: "SEO", value: 12, percent: 39, color: "#f9a137" },
  { label: "Support", value: 4, percent: 13, color: "#e8891a" },
] as const;

export const demoProjects = [
  {
    id: "prj_1",
    name: "Northline storefront",
    service: "Website",
    status: "In progress" as const,
    progress: 72,
    manager: "JZ Delivery",
    updated: "Today",
    nextMilestone: "Dev handoff · Aug 5",
  },
  {
    id: "prj_2",
    name: "Loyalty app MVP",
    service: "App",
    status: "In progress" as const,
    progress: 41,
    manager: "JZ Product",
    updated: "Yesterday",
    nextMilestone: "Prototype review · Aug 12",
  },
  {
    id: "prj_3",
    name: "Organic search sprint",
    service: "SEO",
    status: "Review" as const,
    progress: 88,
    manager: "JZ Growth",
    updated: "3 days ago",
    nextMilestone: "Report delivery · Aug 2",
  },
] as const;

export const demoInvoices = [
  {
    id: "INV-1048",
    title: "Website redesign — milestone 2",
    amount: "PKR 420,000",
    issued: "Jul 22, 2026",
    due: "Aug 5, 2026",
    status: "Due" as const,
  },
  {
    id: "INV-1041",
    title: "SEO retainer — July",
    amount: "PKR 95,000",
    issued: "Jul 1, 2026",
    due: "Jul 15, 2026",
    status: "Paid" as const,
  },
  {
    id: "INV-1036",
    title: "App discovery workshop",
    amount: "PKR 180,000",
    issued: "Jun 12, 2026",
    due: "Jun 26, 2026",
    status: "Paid" as const,
  },
  {
    id: "INV-1050",
    title: "Support block — August",
    amount: "PKR 60,000",
    issued: "Jul 28, 2026",
    due: "Aug 12, 2026",
    status: "Open" as const,
  },
] as const;

export type InvoiceStatus = "Due" | "Open" | "Paid";

export const demoMessages = [
  {
    id: "msg_1",
    from: "Sara Malik",
    role: "Account lead",
    preview: "Design review board is ready — please confirm by Thursday.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "msg_2",
    from: "Hamza Ali",
    role: "Developer",
    preview: "Staging URL updated. Checkout flow is ready for QA.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "msg_3",
    from: "JZ Billing",
    role: "Finance",
    preview: "Invoice INV-1048 is available in your billing tab.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "msg_4",
    from: "Noor Fatima",
    role: "SEO",
    preview: "Keyword map attached for the August sprint.",
    time: "3 days ago",
    unread: false,
  },
] as const;

export const demoFiles = [
  {
    id: "file_1",
    name: "Northline_Brand_Guidelines.pdf",
    type: "PDF",
    size: "4.2 MB",
    uploaded: "Jul 27, 2026",
    project: "Northline storefront",
  },
  {
    id: "file_2",
    name: "Homepage_Wireframes_v3.fig",
    type: "FIG",
    size: "12.8 MB",
    uploaded: "Jul 26, 2026",
    project: "Northline storefront",
  },
  {
    id: "file_3",
    name: "SEO_Keyword_Map_Aug.xlsx",
    type: "XLS",
    size: "890 KB",
    uploaded: "Jul 24, 2026",
    project: "Organic search sprint",
  },
  {
    id: "file_4",
    name: "App_User_Flows.png",
    type: "PNG",
    size: "2.1 MB",
    uploaded: "Jul 20, 2026",
    project: "Loyalty app MVP",
  },
  {
    id: "file_5",
    name: "Staging_Credentials.txt",
    type: "TXT",
    size: "4 KB",
    uploaded: "Jul 18, 2026",
    project: "Northline storefront",
  },
  {
    id: "file_6",
    name: "July_Performance_Report.pdf",
    type: "PDF",
    size: "1.6 MB",
    uploaded: "Jul 15, 2026",
    project: "Organic search sprint",
  },
] as const;

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
      a: "Go to Invoices and choose Pay on any open or due invoice. Demo mode marks it paid locally.",
    },
    {
      q: "Who is my account lead?",
      a: "Sara Malik is your primary contact. Message her from the Messages tab anytime.",
    },
  ],
} as const;

export const profileCopy = {
  title: "Profile",
  lede: "Keep your company and contact details current.",
  save: "Save changes",
  saving: "Saving…",
  saved: "Profile updated for this demo session.",
} as const;
