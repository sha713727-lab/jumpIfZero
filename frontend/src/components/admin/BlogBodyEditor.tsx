"use client";

import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/AdminFormModal";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminVideoField } from "@/components/admin/AdminVideoField";
import { adminIcons } from "@/components/admin/AdminIcons";
import {
  createBlogBlock,
  type BlogBlock,
  type BlogBodyDocument,
  type BlogImageAlign,
  type BlogImageSize,
} from "@/lib/blogBody";

type BlogBodyEditorProps = {
  readonly value: BlogBodyDocument;
  readonly onChange: (value: BlogBodyDocument) => void;
};

const ADD_OPTIONS: ReadonlyArray<{
  readonly type: BlogBlock["type"];
  readonly label: string;
  readonly icon: keyof typeof adminIcons;
}> = [
  { type: "heading", label: "Heading", icon: "blockHeading" },
  { type: "paragraph", label: "Paragraph", icon: "blockParagraph" },
  { type: "list", label: "Bullet list", icon: "blockList" },
  { type: "quote", label: "Quote", icon: "blockQuote" },
  { type: "image", label: "Image", icon: "blockImage" },
  { type: "video", label: "Video", icon: "blockVideo" },
];

const ALIGN_OPTIONS: ReadonlyArray<{
  readonly value: BlogImageAlign;
  readonly label: string;
}> = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "full", label: "Full width" },
];

const SIZE_OPTIONS: ReadonlyArray<{
  readonly value: BlogImageSize;
  readonly label: string;
}> = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
  { value: "full", label: "Full" },
];

export function BlogBodyEditor({ value, onChange }: BlogBodyEditorProps) {
  const TrashIcon = adminIcons.trash;
  const ChevronUpIcon = adminIcons.chevronUp;
  const ChevronDownIcon = adminIcons.chevronDown;

  const setBlocks = (blocks: readonly BlogBlock[]) => {
    onChange({ version: 1, blocks });
  };

  const updateBlock = (id: string, next: BlogBlock) => {
    setBlocks(value.blocks.map((block) => (block.id === id ? next : block)));
  };

  const removeBlock = (id: string) => {
    const next = value.blocks.filter((block) => block.id !== id);
    setBlocks(next.length > 0 ? next : [createBlogBlock("paragraph")]);
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const index = value.blocks.findIndex((block) => block.id === id);
    if (index < 0) {
      return;
    }
    const target = index + direction;
    if (target < 0 || target >= value.blocks.length) {
      return;
    }
    const blocks = [...value.blocks];
    const [item] = blocks.splice(index, 1);
    if (!item) {
      return;
    }
    blocks.splice(target, 0, item);
    setBlocks(blocks);
  };

  const addBlock = (type: BlogBlock["type"]) => {
    setBlocks([...value.blocks, createBlogBlock(type)]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className={adminLabelClass}>Content blocks</span>
        <span className="text-[0.72rem] font-semibold text-black/40">
          {value.blocks.length} block{value.blocks.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-3">
        {value.blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-2xl border border-black/10 bg-white p-3 shadow-[0_4px_14px_rgba(47,58,40,0.04)]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[0.72rem] font-extrabold tracking-[0.14em] text-black/40 uppercase">
                {block.type}
                {block.type === "heading" ? ` · H${block.level}` : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => moveBlock(block.id, -1)}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-30"
                >
                  <ChevronUpIcon className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === value.blocks.length - 1}
                  onClick={() => moveBlock(block.id, 1)}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white disabled:opacity-30"
                >
                  <ChevronDownIcon className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove block"
                  onClick={() => removeBlock(block.id)}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-black/10 bg-white"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>

            {block.type === "heading" ? (
              <div className="space-y-3">
                <label className="block">
                  <span className={adminLabelClass}>Level</span>
                  <select
                    className={adminFieldClass}
                    value={block.level}
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        level: event.target.value === "3" ? 3 : 2,
                      })
                    }
                  >
                    <option value={2}>Heading 2</option>
                    <option value={3}>Heading 3</option>
                  </select>
                </label>
                <label className="block">
                  <span className={adminLabelClass}>Text</span>
                  <input
                    className={adminFieldClass}
                    value={block.text}
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        text: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}

            {block.type === "paragraph" ? (
              <label className="block">
                <span className={adminLabelClass}>Text</span>
                <textarea
                  className={`${adminFieldClass} min-h-[6rem] resize-y`}
                  value={block.text}
                  onChange={(event) =>
                    updateBlock(block.id, {
                      ...block,
                      text: event.target.value,
                    })
                  }
                />
              </label>
            ) : null}

            {block.type === "list" ? (
              <label className="block">
                <span className={adminLabelClass}>Items (one per line)</span>
                <textarea
                  className={`${adminFieldClass} min-h-[6rem] resize-y`}
                  value={block.items.join("\n")}
                  onChange={(event) =>
                    updateBlock(block.id, {
                      ...block,
                      items: event.target.value.split("\n"),
                    })
                  }
                />
              </label>
            ) : null}

            {block.type === "quote" ? (
              <div className="space-y-3">
                <label className="block">
                  <span className={adminLabelClass}>Quote</span>
                  <textarea
                    className={`${adminFieldClass} min-h-[5rem] resize-y`}
                    value={block.text}
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        text: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="block">
                  <span className={adminLabelClass}>Attribution</span>
                  <input
                    className={adminFieldClass}
                    value={block.attribution}
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        attribution: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}

            {block.type === "image" ? (
              <div className="space-y-3">
                <AdminImageField
                  label="Image"
                  value={block.imagePath}
                  onChange={(imagePath) =>
                    updateBlock(block.id, { ...block, imagePath })
                  }
                />
                <label className="block">
                  <span className={adminLabelClass}>Alt text</span>
                  <input
                    className={adminFieldClass}
                    value={block.alt}
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        alt: event.target.value,
                      })
                    }
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className={adminLabelClass}>Alignment</span>
                    <select
                      className={adminFieldClass}
                      value={block.align}
                      onChange={(event) =>
                        updateBlock(block.id, {
                          ...block,
                          align: event.target.value as BlogImageAlign,
                        })
                      }
                    >
                      {ALIGN_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className={adminLabelClass}>Size</span>
                    <select
                      className={adminFieldClass}
                      value={block.size}
                      onChange={(event) =>
                        updateBlock(block.id, {
                          ...block,
                          size: event.target.value as BlogImageSize,
                        })
                      }
                    >
                      {SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ) : null}

            {block.type === "video" ? (
              <div className="space-y-3">
                <AdminVideoField
                  label="Upload video (MP4 or WebM)"
                  value={block.videoPath}
                  onChange={(videoPath) =>
                    updateBlock(block.id, { ...block, videoPath })
                  }
                />
                <label className="block">
                  <span className={adminLabelClass}>
                    Or YouTube / Vimeo URL
                  </span>
                  <input
                    className={adminFieldClass}
                    value={block.url}
                    placeholder="https://www.youtube.com/watch?v=…"
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        url: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="block">
                  <span className={adminLabelClass}>Caption</span>
                  <input
                    className={adminFieldClass}
                    value={block.caption}
                    onChange={(event) =>
                      updateBlock(block.id, {
                        ...block,
                        caption: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {ADD_OPTIONS.map((option) => {
          const Icon = adminIcons[option.icon];
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => addBlock(option.type)}
              className="inline-flex items-center gap-2 rounded-xl border border-black/12 bg-white px-3 py-2 text-[0.78rem] font-semibold text-[#2f3a28] hover:border-brand/35 hover:text-brand"
            >
              <Icon className="size-4 shrink-0" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
