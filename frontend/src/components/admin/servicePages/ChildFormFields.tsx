"use client";

import type { Dispatch, SetStateAction } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import {
  TECH_CATEGORIES,
  type BenefitForm,
  type BuildItemForm,
  type FaqForm,
  type OfferingForm,
  type ProcessStepForm,
  type RelatedForm,
  type TechnologyForm,
} from "@/components/admin/servicePages/types";
import type { ServicePageCollection } from "@/lib/data/adminServicePages";

type ChildForms = {
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
};

type ChildFormFieldsProps = {
  readonly collection: ServicePageCollection;
  readonly forms: ChildForms;
  readonly setOffering: Dispatch<SetStateAction<OfferingForm>>;
  readonly setBuildItem: Dispatch<SetStateAction<BuildItemForm>>;
  readonly setProcessStep: Dispatch<SetStateAction<ProcessStepForm>>;
  readonly setTechnology: Dispatch<SetStateAction<TechnologyForm>>;
  readonly setBenefit: Dispatch<SetStateAction<BenefitForm>>;
  readonly setCapability: Dispatch<SetStateAction<BenefitForm>>;
  readonly setProblem: Dispatch<SetStateAction<BenefitForm>>;
  readonly setComparisonPoint: Dispatch<SetStateAction<BenefitForm>>;
  readonly setFaq: Dispatch<SetStateAction<FaqForm>>;
  readonly setRelated: Dispatch<SetStateAction<RelatedForm>>;
};

function TitledChildFields({
  form,
  onChange,
}: {
  readonly form: BenefitForm;
  readonly onChange: Dispatch<SetStateAction<BenefitForm>>;
}) {
  return (
    <>
      <label className="block">
        <span className={adminLabelClass}>Title</span>
        <input
          className={adminFieldClass}
          value={form.title}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
        />
      </label>
      <label className="block">
        <span className={adminLabelClass}>Body</span>
        <textarea
          className={`${adminFieldClass} min-h-[5rem] resize-y`}
          value={form.body}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              body: event.target.value,
            }))
          }
        />
      </label>
      <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              active: event.target.checked,
            }))
          }
        />
        Active on site
      </label>
    </>
  );
}

export function ChildFormFields({
  collection,
  forms,
  setOffering,
  setBuildItem,
  setProcessStep,
  setTechnology,
  setBenefit,
  setCapability,
  setProblem,
  setComparisonPoint,
  setFaq,
  setRelated,
}: ChildFormFieldsProps) {
  if (collection === "offerings") {
    const form = forms.offering;
    return (
      <>
        <label className="block">
          <span className={adminLabelClass}>Title</span>
          <input
            className={adminFieldClass}
            value={form.title}
            onChange={(event) =>
              setOffering((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Description</span>
          <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.description}
            onChange={(event) =>
              setOffering((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>CTA label</span>
          <input
            className={adminFieldClass}
            value={form.ctaLabel}
            onChange={(event) =>
              setOffering((current) => ({
                ...current,
                ctaLabel: event.target.value,
              }))
            }
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>CTA href</span>
          <input
            className={adminFieldClass}
            value={form.ctaHref}
            onChange={(event) =>
              setOffering((current) => ({
                ...current,
                ctaHref: event.target.value,
              }))
            }
          />
        </label>
        <AdminImageField
          label="Image"
          value={form.imagePath}
          onChange={(imagePath) =>
            setOffering((current) => ({ ...current, imagePath }))
          }
        />
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setOffering((current) => ({
                ...current,
                active: event.target.checked,
              }))
            }
          />
          Active on site
        </label>
      </>
    );
  }

  if (collection === "build-items") {
    const form = forms.buildItem;
    return (
      <>
        <label className="block">
          <span className={adminLabelClass}>Label</span>
          <input
            className={adminFieldClass}
            value={form.label}
            onChange={(event) =>
              setBuildItem((current) => ({
                ...current,
                label: event.target.value,
              }))
            }
          />
        </label>
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setBuildItem((current) => ({
                ...current,
                active: event.target.checked,
              }))
            }
          />
          Active on site
        </label>
      </>
    );
  }

  if (collection === "process-steps") {
    const form = forms.processStep;
    return (
      <>
        <label className="block">
          <span className={adminLabelClass}>Step number</span>
          <input
            type="number"
            min={1}
            max={99}
            className={adminFieldClass}
            value={form.stepNumber}
            onChange={(event) =>
              setProcessStep((current) => ({
                ...current,
                stepNumber: Number(event.target.value) || 1,
              }))
            }
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Title</span>
          <input
            className={adminFieldClass}
            value={form.title}
            onChange={(event) =>
              setProcessStep((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Body</span>
          <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.body}
            onChange={(event) =>
              setProcessStep((current) => ({
                ...current,
                body: event.target.value,
              }))
            }
          />
        </label>
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setProcessStep((current) => ({
                ...current,
                active: event.target.checked,
              }))
            }
          />
          Active on site
        </label>
      </>
    );
  }

  if (collection === "technologies") {
    const form = forms.technology;
    return (
      <>
        <label className="block">
          <span className={adminLabelClass}>Category</span>
          <select
            className={adminFieldClass}
            value={form.category}
            onChange={(event) =>
              setTechnology((current) => ({
                ...current,
                category: event.target.value as TechnologyForm["category"],
              }))
            }
          >
            {TECH_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={adminLabelClass}>Name</span>
          <input
            className={adminFieldClass}
            value={form.name}
            onChange={(event) =>
              setTechnology((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </label>
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setTechnology((current) => ({
                ...current,
                active: event.target.checked,
              }))
            }
          />
          Active on site
        </label>
      </>
    );
  }

  if (collection === "benefits") {
    return (
      <TitledChildFields form={forms.benefit} onChange={setBenefit} />
    );
  }

  if (collection === "capabilities") {
    return (
      <TitledChildFields form={forms.capability} onChange={setCapability} />
    );
  }

  if (collection === "problems") {
    return (
      <TitledChildFields form={forms.problem} onChange={setProblem} />
    );
  }

  if (collection === "comparison-points") {
    return (
      <TitledChildFields
        form={forms.comparisonPoint}
        onChange={setComparisonPoint}
      />
    );
  }

  if (collection === "related") {
    const form = forms.related;
    return (
      <>
        <label className="block">
          <span className={adminLabelClass}>Related service page ID</span>
          <input
            className={adminFieldClass}
            value={form.relatedServicePageId}
            onChange={(event) =>
              setRelated((current) => ({
                ...current,
                relatedServicePageId: event.target.value,
              }))
            }
            placeholder="UUID"
          />
        </label>
        <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setRelated((current) => ({
                ...current,
                active: event.target.checked,
              }))
            }
          />
          Active on site
        </label>
      </>
    );
  }

  const form = forms.faq;
  return (
    <>
      <label className="block">
        <span className={adminLabelClass}>Question</span>
        <input
          className={adminFieldClass}
          value={form.question}
          onChange={(event) =>
            setFaq((current) => ({
              ...current,
              question: event.target.value,
            }))
          }
        />
      </label>
      <label className="block">
        <span className={adminLabelClass}>Answer</span>
        <textarea
          className={`${adminFieldClass} min-h-[5rem] resize-y`}
          value={form.answer}
          onChange={(event) =>
            setFaq((current) => ({
              ...current,
              answer: event.target.value,
            }))
          }
        />
      </label>
      <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) =>
            setFaq((current) => ({
              ...current,
              active: event.target.checked,
            }))
          }
        />
        Active on site
      </label>
    </>
  );
}

type ChildRowLabelProps = {
  readonly collection: ServicePageCollection;
  readonly item: {
    readonly title?: string;
    readonly label?: string;
    readonly name?: string;
    readonly question?: string;
    readonly stepNumber?: number;
    readonly category?: string;
    readonly relatedServicePageId?: string;
    readonly active: boolean;
  };
};

export function childRowLabel(
  collection: ServicePageCollection,
  item: ChildRowLabelProps["item"],
): string {
  switch (collection) {
    case "offerings":
    case "benefits":
    case "capabilities":
    case "problems":
    case "comparison-points":
      return item.title ?? "";
    case "build-items":
      return item.label ?? "";
    case "process-steps":
      return `${item.stepNumber ?? ""}. ${item.title ?? ""}`;
    case "technologies":
      return `${item.category ?? ""} · ${item.name ?? ""}`;
    case "faqs":
      return item.question ?? "";
    case "related":
      return item.title || item.relatedServicePageId || "";
  }
}
