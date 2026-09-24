"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminFormModal,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import { ChildFormFields, childRowLabel } from "@/components/admin/servicePages/ChildFormFields";
import { PageFieldPanels } from "@/components/admin/servicePages/PageFieldPanels";
import {
  EDITOR_TABS,
  cardClass,
  collectionForTab,
  emptyBenefit,
  emptyBuildItem,
  emptyFaq,
  emptyOffering,
  emptyProcessStep,
  emptyRelated,
  emptyTechnology,
  nextSortOrder,
  pageFormFromDetail,
  benefitFormFromItem,
  buildItemFormFromItem,
  faqFormFromItem,
  offeringFormFromItem,
  processStepFormFromItem,
  relatedFormFromItem,
  technologyFormFromItem,
  type BenefitForm,
  type BuildItemForm,
  type EditorTabId,
  type FaqForm,
  type OfferingForm,
  type PageForm,
  type ProcessStepForm,
  type RelatedForm,
  type TechnologyForm,
} from "@/components/admin/servicePages/types";
import type {
  AdminServicePageChild,
  AdminServicePageDetail,
  ServicePageCollection,
} from "@/lib/data/adminServicePages";
import {
  archiveAdminServicePageChildAction,
  createAdminServicePageChildAction,
  getAdminServicePageBySlugAction,
  reorderAdminServicePageChildrenAction,
  updateAdminServicePageAction,
  updateAdminServicePageChildAction,
} from "@/lib/submitAdminServicePage";
type ServicePageEditorPageProps = {
  readonly slug: string;
};
type ChildIdentity = {
  readonly id: string;
  readonly sortOrder: number;
  readonly version: number;
  readonly active: boolean;
  readonly publishedAt: string | null;
};
function isScalarTab(
  tab: EditorTabId,
): tab is "general" | "hero" | "introduction" | "cta" {
  return (
    tab === "general" ||
    tab === "hero" ||
    tab === "introduction" ||
    tab === "cta"
  );
}
function sectionHeadingMeta(tab: EditorTabId): {
  key:
    | "offeringsHeading"
    | "buildHeading"
    | "processHeading"
    | "technologiesHeading"
    | "benefitsHeading"
    | "capabilitiesHeading"
    | "problemsHeading"
    | "comparisonHeading"
    | "faqsHeading";
  label: string;
  introKey?: "benefitsIntro" | "capabilitiesIntro" | "problemsIntro";
  introLabel?: string;
  showComparisonBody?: boolean;
} | null {
  switch (tab) {
    case "offerings":
      return { key: "offeringsHeading", label: "Offerings heading" };
    case "build":
      return { key: "buildHeading", label: "What we build heading" };
    case "process":
      return { key: "processHeading", label: "Process heading" };
    case "technologies":
      return { key: "technologiesHeading", label: "Technologies heading" };
    case "benefits":
      return {
        key: "benefitsHeading",
        label: "Benefits heading",
        introKey: "benefitsIntro",
        introLabel: "Benefits intro",
      };
    case "capabilities":
      return {
        key: "capabilitiesHeading",
        label: "Capabilities heading",
        introKey: "capabilitiesIntro",
        introLabel: "Capabilities intro",
      };
    case "problems":
      return {
        key: "problemsHeading",
        label: "Problems heading",
        introKey: "problemsIntro",
        introLabel: "Problems intro",
      };
    case "comparison":
      return {
        key: "comparisonHeading",
        label: "Comparison heading",
        showComparisonBody: true,
      };
    case "faqs":
      return { key: "faqsHeading", label: "FAQs heading" };
    default:
      return null;
  }
}
function childrenForCollection(
  page: AdminServicePageDetail,
  collection: ServicePageCollection,
): readonly (AdminServicePageChild & ChildIdentity)[] {
  switch (collection) {
    case "offerings":
      return page.offerings;
    case "build-items":
      return page.buildItems;
    case "process-steps":
      return page.processSteps;
    case "technologies":
      return page.technologies;
    case "benefits":
      return page.benefits;
    case "capabilities":
      return page.capabilities;
    case "problems":
      return page.problems;
    case "comparison-points":
      return page.comparisonPoints;
    case "faqs":
      return page.faqs;
    case "related":
      return page.related;
  }
}
function replaceChildInPage(
  page: AdminServicePageDetail,
  collection: ServicePageCollection,
  child: AdminServicePageChild,
): AdminServicePageDetail {
  const id = child.id;
  switch (collection) {
    case "offerings":
      return {
        ...page,
        offerings: page.offerings.some((item) => item.id === id)
          ? page.offerings.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [...page.offerings, child as (typeof page.offerings)[number]],
      };
    case "build-items":
      return {
        ...page,
        buildItems: page.buildItems.some((item) => item.id === id)
          ? page.buildItems.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [...page.buildItems, child as (typeof page.buildItems)[number]],
      };
    case "process-steps":
      return {
        ...page,
        processSteps: page.processSteps.some((item) => item.id === id)
          ? page.processSteps.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [
              ...page.processSteps,
              child as (typeof page.processSteps)[number],
            ],
      };
    case "technologies":
      return {
        ...page,
        technologies: page.technologies.some((item) => item.id === id)
          ? page.technologies.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [
              ...page.technologies,
              child as (typeof page.technologies)[number],
            ],
      };
    case "benefits":
      return {
        ...page,
        benefits: page.benefits.some((item) => item.id === id)
          ? page.benefits.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [...page.benefits, child as (typeof page.benefits)[number]],
      };
    case "capabilities":
      return {
        ...page,
        capabilities: page.capabilities.some((item) => item.id === id)
          ? page.capabilities.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [
              ...page.capabilities,
              child as (typeof page.capabilities)[number],
            ],
      };
    case "problems":
      return {
        ...page,
        problems: page.problems.some((item) => item.id === id)
          ? page.problems.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [...page.problems, child as (typeof page.problems)[number]],
      };
    case "comparison-points":
      return {
        ...page,
        comparisonPoints: page.comparisonPoints.some((item) => item.id === id)
          ? page.comparisonPoints.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [
              ...page.comparisonPoints,
              child as (typeof page.comparisonPoints)[number],
            ],
      };
    case "faqs":
      return {
        ...page,
        faqs: page.faqs.some((item) => item.id === id)
          ? page.faqs.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [...page.faqs, child as (typeof page.faqs)[number]],
      };
    case "related":
      return {
        ...page,
        related: page.related.some((item) => item.id === id)
          ? page.related.map((item) =>
              item.id === id ? (child as typeof item) : item,
            )
          : [...page.related, child as (typeof page.related)[number]],
      };
  }
}
function removeChildFromPage(
  page: AdminServicePageDetail,
  collection: ServicePageCollection,
  childId: string,
): AdminServicePageDetail {
  switch (collection) {
    case "offerings":
      return {
        ...page,
        offerings: page.offerings.filter((item) => item.id !== childId),
      };
    case "build-items":
      return {
        ...page,
        buildItems: page.buildItems.filter((item) => item.id !== childId),
      };
    case "process-steps":
      return {
        ...page,
        processSteps: page.processSteps.filter((item) => item.id !== childId),
      };
    case "technologies":
      return {
        ...page,
        technologies: page.technologies.filter((item) => item.id !== childId),
      };
    case "benefits":
      return {
        ...page,
        benefits: page.benefits.filter((item) => item.id !== childId),
      };
    case "capabilities":
      return {
        ...page,
        capabilities: page.capabilities.filter((item) => item.id !== childId),
      };
    case "problems":
      return {
        ...page,
        problems: page.problems.filter((item) => item.id !== childId),
      };
    case "comparison-points":
      return {
        ...page,
        comparisonPoints: page.comparisonPoints.filter(
          (item) => item.id !== childId,
        ),
      };
    case "faqs":
      return {
        ...page,
        faqs: page.faqs.filter((item) => item.id !== childId),
      };
    case "related":
      return {
        ...page,
        related: page.related.filter((item) => item.id !== childId),
      };
  }
}
function bumpOrder<T extends ChildIdentity>(
  items: readonly T[],
  currentId: string,
  neighborId: string,
  currentSort: number,
  neighborSort: number,
): T[] {
  return items.map((item) => {
    if (item.id === currentId) {
      return { ...item, sortOrder: neighborSort, version: item.version + 1 };
    }
    if (item.id === neighborId) {
      return { ...item, sortOrder: currentSort, version: item.version + 1 };
    }
    return item;
  });
}
function applyReorder(
  page: AdminServicePageDetail,
  collection: ServicePageCollection,
  currentId: string,
  neighborId: string,
  currentSort: number,
  neighborSort: number,
): AdminServicePageDetail {
  switch (collection) {
    case "offerings":
      return {
        ...page,
        offerings: bumpOrder(
          page.offerings,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "build-items":
      return {
        ...page,
        buildItems: bumpOrder(
          page.buildItems,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "process-steps":
      return {
        ...page,
        processSteps: bumpOrder(
          page.processSteps,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "technologies":
      return {
        ...page,
        technologies: bumpOrder(
          page.technologies,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "benefits":
      return {
        ...page,
        benefits: bumpOrder(
          page.benefits,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "capabilities":
      return {
        ...page,
        capabilities: bumpOrder(
          page.capabilities,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "problems":
      return {
        ...page,
        problems: bumpOrder(
          page.problems,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "comparison-points":
      return {
        ...page,
        comparisonPoints: bumpOrder(
          page.comparisonPoints,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "faqs":
      return {
        ...page,
        faqs: bumpOrder(
          page.faqs,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
    case "related":
      return {
        ...page,
        related: bumpOrder(
          page.related,
          currentId,
          neighborId,
          currentSort,
          neighborSort,
        ),
      };
  }
}
function childPayload(
  collection: ServicePageCollection,
  forms: {
    offering: OfferingForm;
    buildItem: BuildItemForm;
    processStep: ProcessStepForm;
    technology: TechnologyForm;
    benefit: BenefitForm;
    capability: BenefitForm;
    problem: BenefitForm;
    comparisonPoint: BenefitForm;
    faq: FaqForm;
    related: RelatedForm;
  },
  extras: { sortOrder: number; version?: number; publishedAt?: string | null },
): Record<string, unknown> | null {
  switch (collection) {
    case "offerings": {
      const title = forms.offering.title.trim();
      if (!title) {
        return null;
      }
      return {
        title,
        description: forms.offering.description.trim(),
        ctaLabel: forms.offering.ctaLabel.trim(),
        ctaHref: forms.offering.ctaHref.trim(),
        imagePath: forms.offering.imagePath.trim(),
        active: forms.offering.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "build-items": {
      const label = forms.buildItem.label.trim();
      if (!label) {
        return null;
      }
      return {
        label,
        active: forms.buildItem.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "process-steps": {
      const title = forms.processStep.title.trim();
      if (!title) {
        return null;
      }
      return {
        stepNumber: forms.processStep.stepNumber,
        title,
        body: forms.processStep.body.trim(),
        active: forms.processStep.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "technologies": {
      const name = forms.technology.name.trim();
      if (!name) {
        return null;
      }
      return {
        category: forms.technology.category,
        name,
        active: forms.technology.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "benefits": {
      const title = forms.benefit.title.trim();
      if (!title) {
        return null;
      }
      return {
        title,
        body: forms.benefit.body.trim(),
        active: forms.benefit.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "capabilities": {
      const title = forms.capability.title.trim();
      if (!title) {
        return null;
      }
      return {
        title,
        body: forms.capability.body.trim(),
        active: forms.capability.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "problems": {
      const title = forms.problem.title.trim();
      if (!title) {
        return null;
      }
      return {
        title,
        body: forms.problem.body.trim(),
        active: forms.problem.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "comparison-points": {
      const title = forms.comparisonPoint.title.trim();
      if (!title) {
        return null;
      }
      return {
        title,
        body: forms.comparisonPoint.body.trim(),
        active: forms.comparisonPoint.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "faqs": {
      const question = forms.faq.question.trim();
      const answer = forms.faq.answer.trim();
      if (!question || !answer) {
        return null;
      }
      return {
        question,
        answer,
        active: forms.faq.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
    case "related": {
      const relatedServicePageId = forms.related.relatedServicePageId.trim();
      if (!relatedServicePageId) {
        return null;
      }
      return {
        relatedServicePageId,
        active: forms.related.active,
        sortOrder: extras.sortOrder,
        version: extras.version,
        publishedAt: extras.publishedAt ?? null,
      };
    }
  }
}
export function ServicePageEditorPage({ slug }: ServicePageEditorPageProps) {
  const [page, setPage] = useState<AdminServicePageDetail | null>(null);
  const [form, setForm] = useState<PageForm | null>(null);
  const [tab, setTab] = useState<EditorTabId>("general");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [offeringForm, setOfferingForm] = useState<OfferingForm>(emptyOffering);
  const [buildItemForm, setBuildItemForm] =
    useState<BuildItemForm>(emptyBuildItem);
  const [processStepForm, setProcessStepForm] =
    useState<ProcessStepForm>(emptyProcessStep);
  const [technologyForm, setTechnologyForm] =
    useState<TechnologyForm>(emptyTechnology);
  const [benefitForm, setBenefitForm] = useState<BenefitForm>(emptyBenefit);
  const [capabilityForm, setCapabilityForm] =
    useState<BenefitForm>(emptyBenefit);
  const [problemForm, setProblemForm] = useState<BenefitForm>(emptyBenefit);
  const [comparisonPointForm, setComparisonPointForm] =
    useState<BenefitForm>(emptyBenefit);
  const [faqForm, setFaqForm] = useState<FaqForm>(emptyFaq);
  const [relatedForm, setRelatedForm] = useState<RelatedForm>(emptyRelated);
  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const ChevronUpIcon = adminIcons.chevronUp;
  const ChevronDownIcon = adminIcons.chevronDown;
  const reload = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await getAdminServicePageBySlugAction(slug);
      if (!result.ok || !("page" in result)) {
        setError("Could not load service page.");
        setLoading(false);
        return;
      }
      setPage(result.page);
      setForm(pageFormFromDetail(result.page));
      setLoading(false);
    });
  }, [slug]);
  useEffect(() => {
    reload();
  }, [reload]);
  const collection = collectionForTab(tab);
  const sortedChildren = useMemo(() => {
    if (!page || !collection) {
      return [];
    }
    return [...childrenForCollection(page, collection)].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }, [page, collection]);
  const savePageFields = () => {
    if (!page || !form) {
      return;
    }
    if (!form.heroH1.trim() || !form.title.trim()) {
      setError("Title and H1 are required.");
      return;
    }
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const result = await updateAdminServicePageAction({
        id: page.id,
        version: page.version,
        slug: page.slug,
        title: form.title.trim(),
        navLabel: form.navLabel.trim(),
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        ogTitle: form.ogTitle.trim(),
        ogDescription: form.ogDescription.trim(),
        ogImagePath: form.ogImagePath.trim(),
        heroEyebrow: form.heroEyebrow.trim(),
        heroH1: form.heroH1.trim(),
        heroDescription: form.heroDescription.trim(),
        heroPrimaryCtaLabel: form.heroPrimaryCtaLabel.trim(),
        heroPrimaryCtaHref: form.heroPrimaryCtaHref.trim(),
        heroSecondaryCtaLabel: form.heroSecondaryCtaLabel.trim(),
        heroSecondaryCtaHref: form.heroSecondaryCtaHref.trim(),
        heroImagePath: form.heroImagePath.trim(),
        introHeading: form.introHeading.trim(),
        introBody: form.introBody.trim(),
        offeringsHeading: form.offeringsHeading.trim(),
        buildHeading: form.buildHeading.trim(),
        processHeading: form.processHeading.trim(),
        technologiesHeading: form.technologiesHeading.trim(),
        benefitsHeading: form.benefitsHeading.trim(),
        benefitsIntro: form.benefitsIntro.trim(),
        capabilitiesHeading: form.capabilitiesHeading.trim(),
        capabilitiesIntro: form.capabilitiesIntro.trim(),
        problemsHeading: form.problemsHeading.trim(),
        problemsIntro: form.problemsIntro.trim(),
        comparisonHeading: form.comparisonHeading.trim(),
        comparisonBody: form.comparisonBody.trim(),
        faqsHeading: form.faqsHeading.trim(),
        ctaHeading: form.ctaHeading.trim(),
        ctaBody: form.ctaBody.trim(),
        ctaLabel: form.ctaLabel.trim(),
        ctaHref: form.ctaHref.trim(),
        sortOrder: page.sortOrder,
        active: form.active,
        publishedAt: page.publishedAt,
      });
      if (!result.ok || !("page" in result)) {
        setError(
          result.ok
            ? "Save failed."
            : result.reason === "conflict"
              ? "This page was updated elsewhere. Refresh and try again."
              : result.reason === "validation"
                ? (result.message ??
                  "Check required fields and URL formats.")
                : "Could not save page.",
        );
        return;
      }
      setPage(result.page);
      setForm(pageFormFromDetail(result.page));
      setNotice("Saved.");
    });
  };
  const openAddChild = () => {
    setEditingId(null);
    setOfferingForm(emptyOffering);
    setBuildItemForm(emptyBuildItem);
    setProcessStepForm(emptyProcessStep);
    setTechnologyForm(emptyTechnology);
    setBenefitForm(emptyBenefit);
    setCapabilityForm(emptyBenefit);
    setProblemForm(emptyBenefit);
    setComparisonPointForm(emptyBenefit);
    setFaqForm(emptyFaq);
    setRelatedForm(emptyRelated);
    setError(null);
    setModalOpen(true);
  };
  const openEditChild = (item: AdminServicePageChild) => {
    if (!collection) {
      return;
    }
    setEditingId(item.id);
    switch (collection) {
      case "offerings":
        setOfferingForm(
          offeringFormFromItem(item as Parameters<typeof offeringFormFromItem>[0]),
        );
        break;
      case "build-items":
        setBuildItemForm(
          buildItemFormFromItem(
            item as Parameters<typeof buildItemFormFromItem>[0],
          ),
        );
        break;
      case "process-steps":
        setProcessStepForm(
          processStepFormFromItem(
            item as Parameters<typeof processStepFormFromItem>[0],
          ),
        );
        break;
      case "technologies":
        setTechnologyForm(
          technologyFormFromItem(
            item as Parameters<typeof technologyFormFromItem>[0],
          ),
        );
        break;
      case "benefits":
        setBenefitForm(
          benefitFormFromItem(item as Parameters<typeof benefitFormFromItem>[0]),
        );
        break;
      case "capabilities":
        setCapabilityForm(
          benefitFormFromItem(item as Parameters<typeof benefitFormFromItem>[0]),
        );
        break;
      case "problems":
        setProblemForm(
          benefitFormFromItem(item as Parameters<typeof benefitFormFromItem>[0]),
        );
        break;
      case "comparison-points":
        setComparisonPointForm(
          benefitFormFromItem(item as Parameters<typeof benefitFormFromItem>[0]),
        );
        break;
      case "faqs":
        setFaqForm(faqFormFromItem(item as Parameters<typeof faqFormFromItem>[0]));
        break;
      case "related":
        setRelatedForm(
          relatedFormFromItem(item as Parameters<typeof relatedFormFromItem>[0]),
        );
        break;
    }
    setError(null);
    setModalOpen(true);
  };
  const saveChild = () => {
    if (!page || !collection) {
      return;
    }
    const forms = {
      offering: offeringForm,
      buildItem: buildItemForm,
      processStep: processStepForm,
      technology: technologyForm,
      benefit: benefitForm,
      capability: capabilityForm,
      problem: problemForm,
      comparisonPoint: comparisonPointForm,
      faq: faqForm,
      related: relatedForm,
    };
    startTransition(async () => {
      setError(null);
      if (editingId) {
        const existing = childrenForCollection(page, collection).find(
          (item) => item.id === editingId,
        );
        if (!existing) {
          setError("Item not found.");
          return;
        }
        const payload = childPayload(collection, forms, {
          sortOrder: existing.sortOrder,
          version: existing.version,
          publishedAt: existing.publishedAt,
        });
        if (!payload) {
          setError("Fill required fields.");
          return;
        }
        const result = await updateAdminServicePageChildAction({
          collection,
          servicePageId: page.id,
          childId: editingId,
          slug: page.slug,
          payload,
        });
        if (!result.ok || !("child" in result)) {
          setError(
            result.ok
              ? "Save failed."
              : result.reason === "conflict"
                ? "This item was updated elsewhere. Refresh and try again."
                : result.reason === "validation"
                  ? (result.message ??
                    "Check required fields and URL formats.")
                  : "Could not save item.",
          );
          return;
        }
        setPage(replaceChildInPage(page, collection, result.child));
      } else {
        const payload = childPayload(collection, forms, {
          sortOrder: nextSortOrder(childrenForCollection(page, collection)),
        });
        if (!payload) {
          setError("Fill required fields.");
          return;
        }
        const result = await createAdminServicePageChildAction({
          collection,
          servicePageId: page.id,
          slug: page.slug,
          payload,
        });
        if (!result.ok || !("child" in result)) {
          setError(
            result.ok
              ? "Could not create item."
              : result.reason === "validation"
                ? (result.message ?? "Check required fields and URL formats.")
                : "Could not create item.",
          );
          return;
        }
        setPage(replaceChildInPage(page, collection, result.child));
      }
      setModalOpen(false);
    });
  };
  const confirmDeleteChild = () => {
    if (!page || !collection || !deleteId) {
      return;
    }
    const existing = childrenForCollection(page, collection).find(
      (item) => item.id === deleteId,
    );
    if (!existing) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await archiveAdminServicePageChildAction({
        collection,
        servicePageId: page.id,
        id: existing.id,
        version: existing.version,
        slug: page.slug,
      });
      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "This item was updated elsewhere. Refresh and try again."
            : "Could not delete item.",
        );
        return;
      }
      setPage(removeChildFromPage(page, collection, deleteId));
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };
  const moveChild = (index: number, direction: "up" | "down") => {
    if (!page || !collection) {
      return;
    }
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    const current = sortedChildren[index];
    const neighbor = sortedChildren[neighborIndex];
    if (!current || !neighbor) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await reorderAdminServicePageChildrenAction({
        collection,
        servicePageId: page.id,
        slug: page.slug,
        items: [
          {
            id: current.id,
            sortOrder: neighbor.sortOrder,
            version: current.version,
          },
          {
            id: neighbor.id,
            sortOrder: current.sortOrder,
            version: neighbor.version,
          },
        ],
      });
      if (!result.ok) {
        setError(
          result.reason === "conflict"
            ? "Order changed elsewhere. Refresh and try again."
            : "Could not reorder.",
        );
        return;
      }
      setPage(
        applyReorder(
          page,
          collection,
          current.id,
          neighbor.id,
          current.sortOrder,
          neighbor.sortOrder,
        ),
      );
    });
  };
  const headingMeta = sectionHeadingMeta(tab);
  const deleteTarget =
    page && collection && deleteId
      ? childrenForCollection(page, collection).find(
          (item) => item.id === deleteId,
        )
      : undefined;
  if (loading && !page) {
    return <p className="text-sm text-black/50">Loading…</p>;
  }
  if (!page || !form) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Service page not found."}
        </p>
        <Link
          href="/admin/services"
          className="text-sm font-semibold text-brand underline"
        >
          Back to service pages
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {collection ? (
        <AdminPageHeader
          title={page.title}
          lede={`Edit /services/${page.slug}`}
          actionLabel="Add item"
          onAction={openAddChild}
        />
      ) : (
        <AdminPageHeader
          title={page.title}
          lede={`Edit /services/${page.slug}`}
        />
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/admin/services"
          className="font-semibold text-black/55 hover:text-black"
        >
          ← Service pages
        </Link>
        <a
          href={page.href || `/services/${page.slug}`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-brand hover:underline"
        >
          View live
        </a>
        <span
          className={`rounded-full px-3 py-1 text-[0.7rem] font-extrabold tracking-[0.12em] uppercase ${
            page.active
              ? "bg-brand/10 text-brand"
              : "bg-black/5 text-black/45"
          }`}
        >
          {page.active ? "Published" : "Draft"}
        </span>
        {page.parentId ? (
          <span className="rounded-full bg-black/5 px-3 py-1 text-[0.7rem] font-extrabold tracking-[0.12em] text-black/45 uppercase">
            Child page
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-[0.88rem] font-semibold text-brand">
          {notice}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {EDITOR_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setNotice(null);
              setError(null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-extrabold tracking-[0.04em] ${
              tab === item.id
                ? "bg-[#0d120b] text-white"
                : "border border-black/10 bg-white text-black/55 hover:border-black/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={`${cardClass} space-y-5 p-5`}>
        {isScalarTab(tab) ? (
          <>
            <PageFieldPanels
              tab={tab}
              form={form}
              onChange={(patch) =>
                setForm((current) =>
                  current === null ? current : { ...current, ...patch },
                )
              }
            />
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-[0.88rem] font-semibold text-brand">
                {notice}
              </p>
            ) : null}
            <div className="flex justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={savePageFields}
                className="rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-extrabold text-white disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </>
        ) : (
          <>
            {headingMeta ? (
              <div className="space-y-4 border-b border-black/8 pb-5">
                <PageFieldPanels
                  tab="sectionHeading"
                  form={form}
                  onChange={(patch) =>
                    setForm((current) =>
                      current === null ? current : { ...current, ...patch },
                    )
                  }
                  sectionKey={headingMeta.key}
                  sectionLabel={headingMeta.label}
                  {...(headingMeta.introKey && headingMeta.introLabel
                    ? {
                        introKey: headingMeta.introKey,
                        introLabel: headingMeta.introLabel,
                      }
                    : {})}
                  {...(headingMeta.showComparisonBody === true
                    ? { showComparisonBody: true as const }
                    : {})}
                />
                {error ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] font-semibold text-red-700">
                    {error}
                  </p>
                ) : null}
                {notice ? (
                  <p className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-[0.88rem] font-semibold text-brand">
                    {notice}
                  </p>
                ) : null}
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={savePageFields}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-[0.84rem] font-extrabold text-[#0d120b] disabled:opacity-60"
                  >
                    Save heading
                  </button>
                </div>
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left">
                <thead>
                  <tr className="border-b border-black/8 text-[0.7rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                    <th className="px-2 py-3">Item</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChildren.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="px-2 py-3 text-[0.92rem] font-semibold text-[#0d120b]">
                        {childRowLabel(collection!, item)}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-extrabold tracking-[0.1em] uppercase ${
                            item.active
                              ? "bg-brand/10 text-brand"
                              : "bg-black/5 text-black/45"
                          }`}
                        >
                          {item.active ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            aria-label="Move up"
                            disabled={pending || index === 0}
                            onClick={() => moveChild(index, "up")}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 disabled:opacity-40"
                          >
                            <ChevronUpIcon className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Move down"
                            disabled={
                              pending || index === sortedChildren.length - 1
                            }
                            onClick={() => moveChild(index, "down")}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 disabled:opacity-40"
                          >
                            <ChevronDownIcon className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Edit"
                            onClick={() => openEditChild(item)}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10"
                          >
                            <EditIcon className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete"
                            onClick={() => {
                              setDeleteId(item.id);
                              setDeleteOpen(true);
                            }}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 text-red-700"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedChildren.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-2 py-6 text-sm text-black/45"
                      >
                        No items yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {collection ? (
        <AdminFormModal
          open={modalOpen}
          title={editingId ? "Edit item" : "Add item"}
          onClose={() => setModalOpen(false)}
          onSubmit={saveChild}
          wide
          error={error}
        >
          <div className="space-y-4">
            <ChildFormFields
              collection={collection}
              forms={{
                offering: offeringForm,
                buildItem: buildItemForm,
                processStep: processStepForm,
                technology: technologyForm,
                benefit: benefitForm,
                capability: capabilityForm,
                problem: problemForm,
                comparisonPoint: comparisonPointForm,
                faq: faqForm,
                related: relatedForm,
              }}
              setOffering={setOfferingForm}
              setBuildItem={setBuildItemForm}
              setProcessStep={setProcessStepForm}
              setTechnology={setTechnologyForm}
              setBenefit={setBenefitForm}
              setCapability={setCapabilityForm}
              setProblem={setProblemForm}
              setComparisonPoint={setComparisonPointForm}
              setFaq={setFaqForm}
              setRelated={setRelatedForm}
            />
          </div>
        </AdminFormModal>
      ) : null}
      <ConfirmDeleteModal
        open={deleteOpen}
        title="Archive item?"
        lede={
          deleteTarget
            ? `Archive “${childRowLabel(collection!, deleteTarget)}”? It will leave the public page.`
            : "Archive this item?"
        }
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDeleteChild}
      />
    </div>
  );
}
