export const contactCopy = {
  title: "Start a scoped engagement.",
  lede: "Tell us what you are building, where it stands, and what “done” means. We reply with a clear next step — not a brochure.",
  responseTime: "Typical reply within 1–2 business days.",
  submit: "Send brief",
  submitting: "Sending…",
  success: "Received. We will reply within 1–2 business days.",
  sendAnother: "Send another",
  validationSummary: "Fix the highlighted fields.",
  serverError: "Could not send. Email us directly or try again.",
  privacy: "We use this only to reply.",
  includeTitle: "What to include",
  includeItems: [
    "Goal and constraint (launch date, rebuild, acquisition, etc.)",
    "Current state (idea / live product / redesign)",
    "Stack or must-keep systems, if any",
    "Budget band or “need a range first”",
  ],
  directTitle: "Direct",
  emailLabel: "Email",
  currencyHint: "$ / € / £",
  mockNotice: "Dev only — submissions are not delivered.",
} as const;

export const contactDetails = {
  email: "hello@example.com",
} as const;

export const projectTypes = [
  "New build",
  "Rebuild / redesign",
  "Growth (SEO / social)",
  "Ongoing partnership",
  "Something else",
] as const;

export const budgetBands = [
  "Under $5k",
  "$5k–15k",
  "$15k–40k",
  "$40k+",
  "Not sure yet",
] as const;

export type ProjectType = (typeof projectTypes)[number];
export type BudgetBand = (typeof budgetBands)[number];

export type ContactFormValues = {
  name: string;
  email: string;
  company: string;
  projectType: ProjectType | "";
  budget: BudgetBand | "";
  message: string;
  website: string;
};

export type ContactFieldErrors = Partial<
  Record<keyof Omit<ContactFormValues, "website">, string>
>;
