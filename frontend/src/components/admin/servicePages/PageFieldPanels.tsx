"use client";

import { AdminImageField } from "@/components/admin/AdminImageField";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import type { PageForm } from "@/components/admin/servicePages/types";

type SectionKey =
  | "offeringsHeading"
  | "buildHeading"
  | "processHeading"
  | "technologiesHeading"
  | "benefitsHeading"
  | "capabilitiesHeading"
  | "problemsHeading"
  | "comparisonHeading"
  | "faqsHeading";

type IntroKey = "benefitsIntro" | "capabilitiesIntro" | "problemsIntro";

type PageFieldPanelsProps = {
  readonly tab: "general" | "hero" | "introduction" | "cta" | "sectionHeading";
  readonly form: PageForm;
  readonly onChange: (next: PageForm) => void;
  readonly sectionKey?: SectionKey;
  readonly sectionLabel?: string;
  readonly introKey?: IntroKey;
  readonly introLabel?: string;
  readonly showComparisonBody?: boolean;
};

export function PageFieldPanels({
  tab,
  form,
  onChange,
  sectionKey,
  sectionLabel,
  introKey,
  introLabel,
  showComparisonBody = false,
}: PageFieldPanelsProps) {
  const set = <K extends keyof PageForm>(key: K, value: PageForm[K]) => {
    onChange({ ...form, [key]: value });
  };

  if (tab === "sectionHeading" && sectionKey && sectionLabel) {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className={adminLabelClass}>{sectionLabel}</span>
          <input
            className={adminFieldClass}
            value={form[sectionKey]}
            onChange={(event) => set(sectionKey, event.target.value)}
          />
        </label>
        {introKey && introLabel ? (
          <label className="block">
            <span className={adminLabelClass}>{introLabel}</span>
            <textarea
              className={`${adminFieldClass} min-h-[5rem] resize-y`}
              value={form[introKey]}
              onChange={(event) => set(introKey, event.target.value)}
            />
          </label>
        ) : null}
        {showComparisonBody ? (
          <label className="block">
            <span className={adminLabelClass}>Comparison body</span>
            <textarea
              className={`${adminFieldClass} min-h-[10rem] resize-y`}
              value={form.comparisonBody}
              onChange={(event) => set("comparisonBody", event.target.value)}
            />
          </label>
        ) : null}
      </div>
    );
  }

  if (tab === "general") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className={adminLabelClass}>Title</span>
          <input
            className={adminFieldClass}
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Nav label</span>
          <input
            className={adminFieldClass}
            value={form.navLabel}
            onChange={(event) => set("navLabel", event.target.value)}
          />
        </label>
        <label className="inline-flex items-center gap-2 self-end text-[0.88rem] font-semibold">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => set("active", event.target.checked)}
          />
          Published on site
        </label>
        <label className="block md:col-span-2">
          <span className={adminLabelClass}>Meta title</span>
          <input
            className={adminFieldClass}
            value={form.metaTitle}
            onChange={(event) => set("metaTitle", event.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className={adminLabelClass}>Meta description</span>
          <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.metaDescription}
            onChange={(event) => set("metaDescription", event.target.value)}
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>OG title</span>
          <input
            className={adminFieldClass}
            value={form.ogTitle}
            onChange={(event) => set("ogTitle", event.target.value)}
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>OG description</span>
          <input
            className={adminFieldClass}
            value={form.ogDescription}
            onChange={(event) => set("ogDescription", event.target.value)}
          />
        </label>
        <div className="md:col-span-2">
          <AdminImageField
            label="OG image"
            value={form.ogImagePath}
            onChange={(ogImagePath) => set("ogImagePath", ogImagePath)}
          />
        </div>
      </div>
    );
  }

  if (tab === "hero") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={adminLabelClass}>Eyebrow</span>
          <input
            className={adminFieldClass}
            value={form.heroEyebrow}
            onChange={(event) => set("heroEyebrow", event.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className={adminLabelClass}>H1</span>
          <input
            className={adminFieldClass}
            value={form.heroH1}
            onChange={(event) => set("heroH1", event.target.value)}
          />
        </label>
        <label className="block md:col-span-2">
          <span className={adminLabelClass}>Description</span>
          <textarea
            className={`${adminFieldClass} min-h-[5rem] resize-y`}
            value={form.heroDescription}
            onChange={(event) => set("heroDescription", event.target.value)}
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Primary CTA label</span>
          <input
            className={adminFieldClass}
            value={form.heroPrimaryCtaLabel}
            onChange={(event) => set("heroPrimaryCtaLabel", event.target.value)}
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Primary CTA href</span>
          <input
            className={adminFieldClass}
            value={form.heroPrimaryCtaHref}
            onChange={(event) => set("heroPrimaryCtaHref", event.target.value)}
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Secondary CTA label</span>
          <input
            className={adminFieldClass}
            value={form.heroSecondaryCtaLabel}
            onChange={(event) =>
              set("heroSecondaryCtaLabel", event.target.value)
            }
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Secondary CTA href</span>
          <input
            className={adminFieldClass}
            value={form.heroSecondaryCtaHref}
            onChange={(event) =>
              set("heroSecondaryCtaHref", event.target.value)
            }
          />
        </label>
        <div className="md:col-span-2">
          <AdminImageField
            label="Hero image"
            value={form.heroImagePath}
            onChange={(heroImagePath) => set("heroImagePath", heroImagePath)}
          />
        </div>
      </div>
    );
  }

  if (tab === "introduction") {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className={adminLabelClass}>Heading</span>
          <input
            className={adminFieldClass}
            value={form.introHeading}
            onChange={(event) => set("introHeading", event.target.value)}
          />
        </label>
        <label className="block">
          <span className={adminLabelClass}>Body</span>
          <textarea
            className={`${adminFieldClass} min-h-[10rem] resize-y`}
            value={form.introBody}
            onChange={(event) => set("introBody", event.target.value)}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block md:col-span-2">
        <span className={adminLabelClass}>Heading</span>
        <input
          className={adminFieldClass}
          value={form.ctaHeading}
          onChange={(event) => set("ctaHeading", event.target.value)}
        />
      </label>
      <label className="block md:col-span-2">
        <span className={adminLabelClass}>Body</span>
        <textarea
          className={`${adminFieldClass} min-h-[5rem] resize-y`}
          value={form.ctaBody}
          onChange={(event) => set("ctaBody", event.target.value)}
        />
      </label>
      <label className="block">
        <span className={adminLabelClass}>CTA label</span>
        <input
          className={adminFieldClass}
          value={form.ctaLabel}
          onChange={(event) => set("ctaLabel", event.target.value)}
        />
      </label>
      <label className="block">
        <span className={adminLabelClass}>CTA href</span>
        <input
          className={adminFieldClass}
          value={form.ctaHref}
          onChange={(event) => set("ctaHref", event.target.value)}
        />
      </label>
    </div>
  );
}
