"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminFormModal,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { adminIcons } from "@/components/admin/AdminIcons";
import type {
  AdminSiteGalleryImage,
  AdminSitePrinciple,
  AdminSiteTestimonial,
} from "@/lib/data/admin";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  archiveAdminSiteGalleryImageAction,
  archiveAdminSitePrincipleAction,
  archiveAdminSiteTestimonialAction,
  createAdminSiteGalleryImageAction,
  createAdminSitePrincipleAction,
  createAdminSiteTestimonialAction,
  reorderAdminSiteGalleryImagesAction,
  reorderAdminSitePrinciplesAction,
  reorderAdminSiteTestimonialsAction,
  updateAdminSiteGalleryImageAction,
  updateAdminSitePrincipleAction,
  updateAdminSiteTestimonialAction,
} from "@/lib/submitAdminSiteSections";

const cardClass =
  "overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]";

type TabId = "gallery" | "stories" | "principles";
type GallerySectionKey = "about_gallery" | "studio_flow";

type GalleryForm = {
  sectionKey: GallerySectionKey;
  image: string;
  altText: string;
  active: boolean;
};

type StoryForm = {
  quote: string;
  authorName: string;
  roleTitle: string;
  company: string;
  accent: "brand" | "secondary" | "dark";
  image: string;
  active: boolean;
};

type PrincipleForm = {
  indexLabel: string;
  title: string;
  body: string;
  accent: "brand" | "secondary";
  image: string;
  imageAlt: string;
  active: boolean;
};

const emptyGallery: GalleryForm = {
  sectionKey: "about_gallery",
  image: "",
  altText: "",
  active: true,
};

const emptyStory: StoryForm = {
  quote: "",
  authorName: "",
  roleTitle: "",
  company: "",
  accent: "brand",
  image: "",
  active: true,
};

const emptyPrinciple: PrincipleForm = {
  indexLabel: "",
  title: "",
  body: "",
  accent: "brand",
  image: "",
  imageAlt: "",
  active: true,
};

function nextSortOrder(items: readonly { sortOrder: number }[]): number {
  if (items.length === 0) {
    return 0;
  }
  return Math.max(...items.map((item) => item.sortOrder)) + 1;
}

export function SiteSectionsPage() {
  const {
    state,
    setSiteGallery,
    setSiteTestimonials,
    setSitePrinciples,
  } = useAdmin();
  const [tab, setTab] = useState<TabId>("gallery");
  const [gallerySection, setGallerySection] =
    useState<GallerySectionKey>("studio_flow");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState<GalleryForm>(emptyGallery);
  const [storyForm, setStoryForm] = useState<StoryForm>(emptyStory);
  const [principleForm, setPrincipleForm] =
    useState<PrincipleForm>(emptyPrinciple);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const EditIcon = adminIcons.edit;
  const TrashIcon = adminIcons.trash;
  const ChevronUpIcon = adminIcons.chevronUp;
  const ChevronDownIcon = adminIcons.chevronDown;

  const sortedGallery = useMemo(
    () =>
      [...state.siteGallery].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.siteGallery],
  );
  const sectionGallery = useMemo(
    () => sortedGallery.filter((item) => item.sectionKey === gallerySection),
    [sortedGallery, gallerySection],
  );
  const sortedStories = useMemo(
    () =>
      [...state.siteTestimonials].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.siteTestimonials],
  );
  const sortedPrinciples = useMemo(
    () =>
      [...state.sitePrinciples].sort((a, b) => a.sortOrder - b.sortOrder),
    [state.sitePrinciples],
  );

  const openAdd = () => {
    setEditingId(null);
    setError(null);
    if (tab === "gallery") {
      setGalleryForm({
        ...emptyGallery,
        sectionKey: gallerySection,
      });
    } else if (tab === "stories") {
      setStoryForm(emptyStory);
    } else {
      setPrincipleForm(emptyPrinciple);
    }
    setModalOpen(true);
  };

  const openEditGallery = (item: AdminSiteGalleryImage) => {
    setEditingId(item.id);
    setGalleryForm({
      sectionKey: item.sectionKey,
      image: item.image,
      altText: item.altText,
      active: item.active,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditStory = (item: AdminSiteTestimonial) => {
    setEditingId(item.id);
    setStoryForm({
      quote: item.quote,
      authorName: item.authorName,
      roleTitle: item.roleTitle,
      company: item.company,
      accent: item.accent,
      image: item.image,
      active: item.active,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditPrinciple = (item: AdminSitePrinciple) => {
    setEditingId(item.id);
    setPrincipleForm({
      indexLabel: item.indexLabel,
      title: item.title,
      body: item.body,
      accent: item.accent,
      image: item.image,
      imageAlt: item.imageAlt,
      active: item.active,
    });
    setError(null);
    setModalOpen(true);
  };

  const save = () => {
    startTransition(async () => {
      setError(null);

      if (tab === "gallery") {
        if (!galleryForm.image.trim()) {
          setError("Image is required.");
          return;
        }
        if (editingId) {
          const existing = state.siteGallery.find((item) => item.id === editingId);
          if (!existing) {
            setError("Image not found.");
            return;
          }
          const result = await updateAdminSiteGalleryImageAction({
            id: existing.id,
            version: existing.version,
            sectionKey: galleryForm.sectionKey,
            image: galleryForm.image,
            altText: galleryForm.altText.trim(),
            sortOrder: existing.sortOrder,
            active: galleryForm.active,
            publishedAt: existing.publishedAt,
          });
          if (!result.ok || !("galleryImage" in result)) {
            setError("Could not save image.");
            return;
          }
          setSiteGallery(
            state.siteGallery.map((item) =>
              item.id === editingId ? result.galleryImage : item,
            ),
          );
        } else {
          const result = await createAdminSiteGalleryImageAction({
            sectionKey: galleryForm.sectionKey,
            image: galleryForm.image,
            altText: galleryForm.altText.trim(),
            sortOrder: nextSortOrder(
              state.siteGallery.filter(
                (item) => item.sectionKey === galleryForm.sectionKey,
              ),
            ),
            active: galleryForm.active,
          });
          if (!result.ok || !("galleryImage" in result)) {
            setError("Could not create image.");
            return;
          }
          setSiteGallery([...state.siteGallery, result.galleryImage]);
        }
      } else if (tab === "stories") {
        if (!storyForm.quote.trim() || !storyForm.authorName.trim()) {
          setError("Quote and author are required.");
          return;
        }
        if (editingId) {
          const existing = state.siteTestimonials.find(
            (item) => item.id === editingId,
          );
          if (!existing) {
            setError("Story not found.");
            return;
          }
          const result = await updateAdminSiteTestimonialAction({
            id: existing.id,
            version: existing.version,
            quote: storyForm.quote.trim(),
            authorName: storyForm.authorName.trim(),
            roleTitle: storyForm.roleTitle.trim(),
            company: storyForm.company.trim(),
            accent: storyForm.accent,
            image: storyForm.image,
            sortOrder: existing.sortOrder,
            active: storyForm.active,
            publishedAt: existing.publishedAt,
          });
          if (!result.ok || !("testimonial" in result)) {
            setError("Could not save story.");
            return;
          }
          setSiteTestimonials(
            state.siteTestimonials.map((item) =>
              item.id === editingId ? result.testimonial : item,
            ),
          );
        } else {
          const result = await createAdminSiteTestimonialAction({
            quote: storyForm.quote.trim(),
            authorName: storyForm.authorName.trim(),
            roleTitle: storyForm.roleTitle.trim(),
            company: storyForm.company.trim(),
            accent: storyForm.accent,
            image: storyForm.image,
            sortOrder: nextSortOrder(state.siteTestimonials),
            active: storyForm.active,
          });
          if (!result.ok || !("testimonial" in result)) {
            setError("Could not create story.");
            return;
          }
          setSiteTestimonials([...state.siteTestimonials, result.testimonial]);
        }
      } else {
        if (!principleForm.title.trim()) {
          setError("Title is required.");
          return;
        }
        if (editingId) {
          const existing = state.sitePrinciples.find(
            (item) => item.id === editingId,
          );
          if (!existing) {
            setError("Principle not found.");
            return;
          }
          const result = await updateAdminSitePrincipleAction({
            id: existing.id,
            version: existing.version,
            indexLabel: principleForm.indexLabel.trim(),
            title: principleForm.title.trim(),
            body: principleForm.body.trim(),
            accent: principleForm.accent,
            image: principleForm.image,
            imageAlt: principleForm.imageAlt.trim(),
            sortOrder: existing.sortOrder,
            active: principleForm.active,
            publishedAt: existing.publishedAt,
          });
          if (!result.ok || !("principle" in result)) {
            setError("Could not save principle.");
            return;
          }
          setSitePrinciples(
            state.sitePrinciples.map((item) =>
              item.id === editingId ? result.principle : item,
            ),
          );
        } else {
          const result = await createAdminSitePrincipleAction({
            indexLabel: principleForm.indexLabel.trim(),
            title: principleForm.title.trim(),
            body: principleForm.body.trim(),
            accent: principleForm.accent,
            image: principleForm.image,
            imageAlt: principleForm.imageAlt.trim(),
            sortOrder: nextSortOrder(state.sitePrinciples),
            active: principleForm.active,
          });
          if (!result.ok || !("principle" in result)) {
            setError("Could not create principle.");
            return;
          }
          setSitePrinciples([...state.sitePrinciples, result.principle]);
        }
      }

      setModalOpen(false);
    });
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    startTransition(async () => {
      if (tab === "gallery") {
        const existing = state.siteGallery.find((item) => item.id === deleteId);
        if (!existing) {
          return;
        }
        const result = await archiveAdminSiteGalleryImageAction({
          id: existing.id,
          version: existing.version,
        });
        if (!result.ok) {
          return;
        }
        setSiteGallery(state.siteGallery.filter((item) => item.id !== deleteId));
      } else if (tab === "stories") {
        const existing = state.siteTestimonials.find(
          (item) => item.id === deleteId,
        );
        if (!existing) {
          return;
        }
        const result = await archiveAdminSiteTestimonialAction({
          id: existing.id,
          version: existing.version,
        });
        if (!result.ok) {
          return;
        }
        setSiteTestimonials(
          state.siteTestimonials.filter((item) => item.id !== deleteId),
        );
      } else {
        const existing = state.sitePrinciples.find(
          (item) => item.id === deleteId,
        );
        if (!existing) {
          return;
        }
        const result = await archiveAdminSitePrincipleAction({
          id: existing.id,
          version: existing.version,
        });
        if (!result.ok) {
          return;
        }
        setSitePrinciples(
          state.sitePrinciples.filter((item) => item.id !== deleteId),
        );
      }
      setDeleteOpen(false);
      setDeleteId(null);
    });
  };

  const moveGallery = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sectionGallery.length) {
      return;
    }
    const nextSection = [...sectionGallery];
    const current = nextSection[index];
    const swap = nextSection[target];
    if (!current || !swap) {
      return;
    }
    nextSection[index] = swap;
    nextSection[target] = current;
    const reorderedSection = nextSection.map((item, sortOrder) => ({
      ...item,
      sortOrder,
    }));
    const otherItems = sortedGallery.filter(
      (item) => item.sectionKey !== gallerySection,
    );
    const next = [...otherItems, ...reorderedSection].sort((a, b) => {
      if (a.sectionKey === b.sectionKey) {
        return a.sortOrder - b.sortOrder;
      }
      return a.sectionKey.localeCompare(b.sectionKey);
    });
    const items = reorderedSection.map((item) => ({
      id: item.id,
      sortOrder: item.sortOrder,
      version: item.version,
    }));
    startTransition(async () => {
      const result = await reorderAdminSiteGalleryImagesAction(items);
      if (!result.ok) {
        return;
      }
      setSiteGallery(
        next.map((item) =>
          item.sectionKey === gallerySection
            ? { ...item, version: item.version + 1 }
            : item,
        ),
      );
    });
  };

  const moveStory = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sortedStories.length) {
      return;
    }
    const next = [...sortedStories];
    const current = next[index];
    const swap = next[target];
    if (!current || !swap) {
      return;
    }
    next[index] = swap;
    next[target] = current;
    const items = next.map((item, sortOrder) => ({
      id: item.id,
      sortOrder,
      version: item.version,
    }));
    startTransition(async () => {
      const result = await reorderAdminSiteTestimonialsAction(items);
      if (!result.ok) {
        return;
      }
      setSiteTestimonials(
        next.map((item, sortOrder) => ({
          ...item,
          sortOrder,
          version: item.version + 1,
        })),
      );
    });
  };

  const movePrinciple = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sortedPrinciples.length) {
      return;
    }
    const next = [...sortedPrinciples];
    const current = next[index];
    const swap = next[target];
    if (!current || !swap) {
      return;
    }
    next[index] = swap;
    next[target] = current;
    const items = next.map((item, sortOrder) => ({
      id: item.id,
      sortOrder,
      version: item.version,
    }));
    startTransition(async () => {
      const result = await reorderAdminSitePrinciplesAction(items);
      if (!result.ok) {
        return;
      }
      setSitePrinciples(
        next.map((item, sortOrder) => ({
          ...item,
          sortOrder,
          version: item.version + 1,
        })),
      );
    });
  };

  const addLabel =
    tab === "gallery"
      ? gallerySection === "studio_flow"
        ? "Add Inside the Work image"
        : "Add About Us image"
      : tab === "stories"
        ? "Add story"
        : "Add principle";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site sections"
        lede="Change, add, or remove pictures for About Us spiral, Inside the Work, Client Stories, and principles. Edits show on the public site right away."
        actionLabel={addLabel}
        onAction={openAdd}
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["gallery", "Gallery images"],
            ["stories", "Client stories"],
            ["principles", "Principles"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-3.5 py-2 text-[0.84rem] font-semibold ${
              tab === id
                ? "bg-brand text-cream"
                : "border border-black/10 bg-white text-[#0d120b]/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "gallery" ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["studio_flow", "Inside the Work (About)"],
              ["about_gallery", "About Us spiral (Home)"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGallerySection(id)}
              className={`rounded-lg px-3 py-1.5 text-[0.8rem] font-semibold ${
                gallerySection === id
                  ? "bg-[rgba(92,104,73,0.16)] text-brand"
                  : "border border-black/10 bg-white text-black/55"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          {tab === "gallery" ? (
            <table className="min-w-full text-left">
              <thead className="border-b border-black/8 bg-[#f7f8f4] text-[0.72rem] font-bold tracking-[0.08em] text-black/45 uppercase">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Alt text</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectionGallery.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-[0.9rem] font-medium text-black/45"
                    >
                      No images yet. Use “{addLabel}” to upload the first one.
                    </td>
                  </tr>
                ) : null}
                {sectionGallery.map((item, index) => (
                  <tr key={item.id} className="border-b border-black/6">
                    <td className="px-4 py-3">
                      {item.image ? (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-black/8">
                          <Image
                            src={cmsMediaSrc(item.image)}
                            alt={item.altText || "Gallery"}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <span className="text-[0.84rem] text-black/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[0.84rem] text-black/55">
                      {item.altText || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                          item.active
                            ? "bg-[rgba(92,104,73,0.16)] text-brand"
                            : "bg-black/8 text-black/45"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={pending || index === 0}
                          onClick={() => moveGallery(index, "up")}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <ChevronUpIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={
                            pending || index === sectionGallery.length - 1
                          }
                          onClick={() => moveGallery(index, "down")}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <ChevronDownIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit image"
                          onClick={() => openEditGallery(item)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                        >
                          <EditIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete image"
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteOpen(true);
                          }}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white text-[#8a2f2f]"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {tab === "stories" ? (
            <table className="min-w-full text-left">
              <thead className="border-b border-black/8 bg-[#f7f8f4] text-[0.72rem] font-bold tracking-[0.08em] text-black/45 uppercase">
                <tr>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Quote</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStories.map((item, index) => (
                  <tr key={item.id} className="border-b border-black/6">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-black/8">
                            <Image
                              src={cmsMediaSrc(item.image)}
                              alt={item.authorName}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : null}
                        <div>
                          <p className="text-[0.9rem] font-semibold text-[#0d120b]">
                            {item.authorName}
                          </p>
                          <p className="text-[0.72rem] font-medium text-black/45 uppercase">
                            {item.roleTitle}
                            {item.company ? ` — ${item.company}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[22rem] px-4 py-3 text-[0.84rem] text-black/55">
                      <span className="line-clamp-2">{item.quote}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                          item.active
                            ? "bg-[rgba(92, 104, 73,0.16)] text-brand"
                            : "bg-black/8 text-black/45"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={pending || index === 0}
                          onClick={() => moveStory(index, "up")}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <ChevronUpIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={
                            pending || index === sortedStories.length - 1
                          }
                          onClick={() => moveStory(index, "down")}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <ChevronDownIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit"
                          disabled={pending}
                          onClick={() => openEditStory(item)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <EditIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          disabled={pending}
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteOpen(true);
                          }}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {tab === "principles" ? (
            <table className="min-w-full text-left">
              <thead className="border-b border-black/8 bg-[#f7f8f4] text-[0.72rem] font-bold tracking-[0.08em] text-black/45 uppercase">
                <tr>
                  <th className="px-4 py-3">Principle</th>
                  <th className="px-4 py-3">Body</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrinciples.map((item, index) => (
                  <tr key={item.id} className="border-b border-black/6">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-black/8">
                            <Image
                              src={cmsMediaSrc(item.image)}
                              alt={item.imageAlt || item.title}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : null}
                        <div>
                          <p className="text-[0.72rem] font-bold text-black/40">
                            {item.indexLabel}
                          </p>
                          <p className="text-[0.9rem] font-semibold text-[#0d120b]">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[22rem] px-4 py-3 text-[0.84rem] text-black/55">
                      <span className="line-clamp-2">{item.body}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                          item.active
                            ? "bg-[rgba(92, 104, 73,0.16)] text-brand"
                            : "bg-black/8 text-black/45"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={pending || index === 0}
                          onClick={() => movePrinciple(index, "up")}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <ChevronUpIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={
                            pending || index === sortedPrinciples.length - 1
                          }
                          onClick={() => movePrinciple(index, "down")}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <ChevronDownIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit"
                          disabled={pending}
                          onClick={() => openEditPrinciple(item)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <EditIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          disabled={pending}
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteOpen(true);
                          }}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      <AdminFormModal
        open={modalOpen}
        title={
          editingId
            ? tab === "gallery"
              ? "Edit image"
              : tab === "stories"
                ? "Edit story"
                : "Edit principle"
            : addLabel
        }
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      >
        {error ? (
          <p className="text-[0.84rem] font-medium text-red-700">{error}</p>
        ) : null}

        {tab === "gallery" ? (
          <>
            <AdminImageField
              label="Image"
              value={galleryForm.image}
              onChange={(image) =>
                setGalleryForm((current) => ({ ...current, image }))
              }
            />
            <p className="text-[0.82rem] font-medium text-black/45">
              Section:{" "}
              {galleryForm.sectionKey === "studio_flow"
                ? "Inside the Work (About page)"
                : "About Us spiral (Home)"}
            </p>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Alt text</span>
                <input
                  className={adminFieldClass}
                  value={galleryForm.altText}
                  onChange={(event) =>
                    setGalleryForm((current) => ({
                      ...current,
                      altText: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
              <input
                type="checkbox"
                checked={galleryForm.active}
                onChange={(event) =>
                  setGalleryForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Active on public site
            </label>
          </>
        ) : null}

        {tab === "stories" ? (
          <>
            <AdminImageField
              label="Avatar / logo"
              value={storyForm.image}
              onChange={(image) =>
                setStoryForm((current) => ({ ...current, image }))
              }
            />
            <div>
              <label className="block">
                <span className={adminLabelClass}>Quote</span>
                <textarea
                  className={`${adminFieldClass} min-h-[5rem] resize-y`}
                  value={storyForm.quote}
                  onChange={(event) =>
                    setStoryForm((current) => ({
                      ...current,
                      quote: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Author</span>
                <input
                  className={adminFieldClass}
                  value={storyForm.authorName}
                  onChange={(event) =>
                    setStoryForm((current) => ({
                      ...current,
                      authorName: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Role</span>
                <input
                  className={adminFieldClass}
                  value={storyForm.roleTitle}
                  onChange={(event) =>
                    setStoryForm((current) => ({
                      ...current,
                      roleTitle: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Company</span>
                <input
                  className={adminFieldClass}
                  value={storyForm.company}
                  onChange={(event) =>
                    setStoryForm((current) => ({
                      ...current,
                      company: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Accent</span>
                <select
                  className={adminFieldClass}
                  value={storyForm.accent}
                  onChange={(event) =>
                    setStoryForm((current) => ({
                      ...current,
                      accent: event.target.value as StoryForm["accent"],
                    }))
                  }
                >
                  <option value="brand">Brand</option>
                  <option value="secondary">Secondary</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
              <input
                type="checkbox"
                checked={storyForm.active}
                onChange={(event) =>
                  setStoryForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Active
            </label>
          </>
        ) : null}

        {tab === "principles" ? (
          <>
            <AdminImageField
              label="Image"
              value={principleForm.image}
              onChange={(image) =>
                setPrincipleForm((current) => ({ ...current, image }))
              }
            />
            <div>
              <label className="block">
                <span className={adminLabelClass}>Index label</span>
                <input
                  className={adminFieldClass}
                  value={principleForm.indexLabel}
                  onChange={(event) =>
                    setPrincipleForm((current) => ({
                      ...current,
                      indexLabel: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Title</span>
                <input
                  className={adminFieldClass}
                  value={principleForm.title}
                  onChange={(event) =>
                    setPrincipleForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Body</span>
                <textarea
                  className={`${adminFieldClass} min-h-[5rem] resize-y`}
                  value={principleForm.body}
                  onChange={(event) =>
                    setPrincipleForm((current) => ({
                      ...current,
                      body: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Image alt</span>
                <input
                  className={adminFieldClass}
                  value={principleForm.imageAlt}
                  onChange={(event) =>
                    setPrincipleForm((current) => ({
                      ...current,
                      imageAlt: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className={adminLabelClass}>Accent</span>
                <select
                  className={adminFieldClass}
                  value={principleForm.accent}
                  onChange={(event) =>
                    setPrincipleForm((current) => ({
                      ...current,
                      accent: event.target.value as PrincipleForm["accent"],
                    }))
                  }
                >
                  <option value="brand">Brand</option>
                  <option value="secondary">Secondary</option>
                </select>
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-[0.88rem] font-semibold">
              <input
                type="checkbox"
                checked={principleForm.active}
                onChange={(event) =>
                  setPrincipleForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Active
            </label>
          </>
        ) : null}
      </AdminFormModal>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete item?"
        lede="This archives the item and removes it from the public site."
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
