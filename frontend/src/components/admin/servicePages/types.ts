import type { ServicePageTechCategory } from "@jumpifzero/contracts";
import type {
  AdminServicePageBenefit,
  AdminServicePageBuildItem,
  AdminServicePageDetail,
  AdminServicePageFaq,
  AdminServicePageOffering,
  AdminServicePageProcessStep,
  AdminServicePageRelated,
  AdminServicePageTechnology,
  ServicePageCollection,
} from "@/lib/data/adminServicePages";

export type EditorTabId =
  | "general"
  | "hero"
  | "introduction"
  | "offerings"
  | "build"
  | "process"
  | "technologies"
  | "benefits"
  | "capabilities"
  | "problems"
  | "comparison"
  | "related"
  | "faqs"
  | "cta";

export const EDITOR_TABS: readonly {
  readonly id: EditorTabId;
  readonly label: string;
}[] = [
  { id: "general", label: "General + SEO" },
  { id: "hero", label: "Hero" },
  { id: "introduction", label: "Introduction" },
  { id: "offerings", label: "Offerings" },
  { id: "build", label: "What we build" },
  { id: "process", label: "Process" },
  { id: "technologies", label: "Technologies" },
  { id: "benefits", label: "Benefits" },
  { id: "capabilities", label: "Capabilities" },
  { id: "problems", label: "Problems" },
  { id: "comparison", label: "Comparison" },
  { id: "related", label: "Related" },
  { id: "faqs", label: "FAQs" },
  { id: "cta", label: "CTA" },
] as const;

export const TECH_CATEGORIES: readonly ServicePageTechCategory[] = [
  "frontend",
  "backend",
  "mobile",
  "commerce",
  "database",
  "cloud",
];

export type PageForm = {
  title: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImagePath: string;
  heroEyebrow: string;
  heroH1: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  heroImagePath: string;
  introHeading: string;
  introBody: string;
  offeringsHeading: string;
  buildHeading: string;
  processHeading: string;
  technologiesHeading: string;
  benefitsHeading: string;
  benefitsIntro: string;
  capabilitiesHeading: string;
  capabilitiesIntro: string;
  problemsHeading: string;
  problemsIntro: string;
  comparisonHeading: string;
  comparisonBody: string;
  faqsHeading: string;
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
};

export type OfferingForm = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imagePath: string;
  active: boolean;
};

export type BuildItemForm = {
  label: string;
  active: boolean;
};

export type ProcessStepForm = {
  stepNumber: number;
  title: string;
  body: string;
  active: boolean;
};

export type TechnologyForm = {
  category: ServicePageTechCategory;
  name: string;
  active: boolean;
};

export type BenefitForm = {
  title: string;
  body: string;
  active: boolean;
};

export type FaqForm = {
  question: string;
  answer: string;
  active: boolean;
};

export type RelatedForm = {
  relatedServicePageId: string;
  active: boolean;
};

export const emptyOffering: OfferingForm = {
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "",
  imagePath: "",
  active: true,
};

export const emptyBuildItem: BuildItemForm = {
  label: "",
  active: true,
};

export const emptyProcessStep: ProcessStepForm = {
  stepNumber: 1,
  title: "",
  body: "",
  active: true,
};

export const emptyTechnology: TechnologyForm = {
  category: "frontend",
  name: "",
  active: true,
};

export const emptyBenefit: BenefitForm = {
  title: "",
  body: "",
  active: true,
};

export const emptyFaq: FaqForm = {
  question: "",
  answer: "",
  active: true,
};

export const emptyRelated: RelatedForm = {
  relatedServicePageId: "",
  active: true,
};

export function pageFormFromDetail(page: AdminServicePageDetail): PageForm {
  return {
    title: page.title,
    navLabel: page.navLabel,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImagePath: page.ogImagePath,
    heroEyebrow: page.heroEyebrow,
    heroH1: page.heroH1,
    heroDescription: page.heroDescription,
    heroPrimaryCtaLabel: page.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: page.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: page.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: page.heroSecondaryCtaHref,
    heroImagePath: page.heroImagePath,
    introHeading: page.introHeading,
    introBody: page.introBody,
    offeringsHeading: page.offeringsHeading,
    buildHeading: page.buildHeading,
    processHeading: page.processHeading,
    technologiesHeading: page.technologiesHeading,
    benefitsHeading: page.benefitsHeading,
    benefitsIntro: page.benefitsIntro,
    capabilitiesHeading: page.capabilitiesHeading,
    capabilitiesIntro: page.capabilitiesIntro,
    problemsHeading: page.problemsHeading,
    problemsIntro: page.problemsIntro,
    comparisonHeading: page.comparisonHeading,
    comparisonBody: page.comparisonBody,
    faqsHeading: page.faqsHeading,
    ctaHeading: page.ctaHeading,
    ctaBody: page.ctaBody,
    ctaLabel: page.ctaLabel,
    ctaHref: page.ctaHref,
    active: page.active,
  };
}

export function collectionForTab(tab: EditorTabId): ServicePageCollection | null {
  switch (tab) {
    case "offerings":
      return "offerings";
    case "build":
      return "build-items";
    case "process":
      return "process-steps";
    case "technologies":
      return "technologies";
    case "benefits":
      return "benefits";
    case "capabilities":
      return "capabilities";
    case "problems":
      return "problems";
    case "comparison":
      return "comparison-points";
    case "related":
      return "related";
    case "faqs":
      return "faqs";
    default:
      return null;
  }
}

export function nextSortOrder(
  items: readonly { sortOrder: number }[],
): number {
  if (items.length === 0) {
    return 0;
  }
  return Math.max(...items.map((item) => item.sortOrder)) + 1;
}

export function offeringFormFromItem(
  item: AdminServicePageOffering,
): OfferingForm {
  return {
    title: item.title,
    description: item.description,
    ctaLabel: item.ctaLabel,
    ctaHref: item.ctaHref,
    imagePath: item.imagePath,
    active: item.active,
  };
}

export function buildItemFormFromItem(
  item: AdminServicePageBuildItem,
): BuildItemForm {
  return { label: item.label, active: item.active };
}

export function processStepFormFromItem(
  item: AdminServicePageProcessStep,
): ProcessStepForm {
  return {
    stepNumber: item.stepNumber,
    title: item.title,
    body: item.body,
    active: item.active,
  };
}

export function technologyFormFromItem(
  item: AdminServicePageTechnology,
): TechnologyForm {
  return {
    category: item.category,
    name: item.name,
    active: item.active,
  };
}

export function benefitFormFromItem(
  item: AdminServicePageBenefit,
): BenefitForm {
  return { title: item.title, body: item.body, active: item.active };
}

export function faqFormFromItem(item: AdminServicePageFaq): FaqForm {
  return {
    question: item.question,
    answer: item.answer,
    active: item.active,
  };
}

export function relatedFormFromItem(
  item: AdminServicePageRelated,
): RelatedForm {
  return {
    relatedServicePageId: item.relatedServicePageId,
    active: item.active,
  };
}

export const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";
