export type BlogImageAlign = "left" | "center" | "right" | "full";
export type BlogImageSize = "s" | "m" | "l" | "full";

export type BlogHeadingBlock = {
  readonly id: string;
  readonly type: "heading";
  readonly level: 2 | 3;
  readonly text: string;
};

export type BlogParagraphBlock = {
  readonly id: string;
  readonly type: "paragraph";
  readonly text: string;
};

export type BlogListBlock = {
  readonly id: string;
  readonly type: "list";
  readonly items: readonly string[];
};

export type BlogQuoteBlock = {
  readonly id: string;
  readonly type: "quote";
  readonly text: string;
  readonly attribution: string;
};

export type BlogImageBlock = {
  readonly id: string;
  readonly type: "image";
  readonly imagePath: string;
  readonly alt: string;
  readonly align: BlogImageAlign;
  readonly size: BlogImageSize;
};

export type BlogVideoBlock = {
  readonly id: string;
  readonly type: "video";
  readonly url: string;
  readonly videoPath: string;
  readonly caption: string;
};

export type BlogBlock =
  | BlogHeadingBlock
  | BlogParagraphBlock
  | BlogListBlock
  | BlogQuoteBlock
  | BlogImageBlock
  | BlogVideoBlock;

export type BlogBodyDocument = {
  readonly version: 1;
  readonly blocks: readonly BlogBlock[];
};

const IMAGE_ALIGNS: ReadonlySet<string> = new Set([
  "left",
  "center",
  "right",
  "full",
]);
const IMAGE_SIZES: ReadonlySet<string> = new Set(["s", "m", "l", "full"]);

export function newBlogBlockId(): string {
  return crypto.randomUUID();
}

export function createEmptyBlogBody(): BlogBodyDocument {
  return {
    version: 1,
    blocks: [
      {
        id: newBlogBlockId(),
        type: "paragraph",
        text: "",
      },
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parseBlock(value: unknown): BlogBlock | null {
  if (!isRecord(value) || typeof value.type !== "string") {
    return null;
  }

  const id =
    typeof value.id === "string" && value.id.length > 0
      ? value.id
      : newBlogBlockId();

  switch (value.type) {
    case "heading": {
      const level = value.level === 3 ? 3 : 2;
      return { id, type: "heading", level, text: asString(value.text) };
    }
    case "paragraph":
      return { id, type: "paragraph", text: asString(value.text) };
    case "list": {
      const items = Array.isArray(value.items)
        ? value.items.filter((item): item is string => typeof item === "string")
        : [];
      return { id, type: "list", items };
    }
    case "quote":
      return {
        id,
        type: "quote",
        text: asString(value.text),
        attribution: asString(value.attribution),
      };
    case "image": {
      const align = IMAGE_ALIGNS.has(asString(value.align))
        ? (value.align as BlogImageAlign)
        : "center";
      const size = IMAGE_SIZES.has(asString(value.size))
        ? (value.size as BlogImageSize)
        : "l";
      return {
        id,
        type: "image",
        imagePath: asString(value.imagePath),
        alt: asString(value.alt),
        align,
        size,
      };
    }
    case "video":
      return {
        id,
        type: "video",
        url: asString(value.url),
        videoPath: asString(value.videoPath),
        caption: asString(value.caption),
      };
    default:
      return null;
  }
}

export function parseBlogBody(raw: string): BlogBodyDocument {
  const trimmed = raw.trim();
  if (!trimmed) {
    return createEmptyBlogBody();
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (isRecord(parsed) && parsed.version === 1 && Array.isArray(parsed.blocks)) {
      const blocks = parsed.blocks
        .map(parseBlock)
        .filter((block): block is BlogBlock => block !== null);
      if (blocks.length > 0) {
        return { version: 1, blocks };
      }
    }
  } catch {
    /* legacy plain text */
  }

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    version: 1,
    blocks: (paragraphs.length > 0 ? paragraphs : [trimmed]).map((text) => ({
      id: newBlogBlockId(),
      type: "paragraph" as const,
      text,
    })),
  };
}

export function serializeBlogBody(doc: BlogBodyDocument): string {
  return JSON.stringify({
    version: 1,
    blocks: doc.blocks,
  });
}

export function blogBodyWordCount(doc: BlogBodyDocument): number {
  const parts: string[] = [];
  for (const block of doc.blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
        parts.push(block.text);
        break;
      case "quote":
        parts.push(block.text, block.attribution);
        break;
      case "list":
        parts.push(...block.items);
        break;
      case "image":
        parts.push(block.alt);
        break;
      case "video":
        parts.push(block.caption);
        break;
    }
  }
  return parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

export function estimateBlogReadTime(doc: BlogBodyDocument): string {
  const minutes = Math.max(1, Math.round(blogBodyWordCount(doc) / 200));
  return `${minutes} min`;
}

export function blogVideoEmbedSrc(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function createBlogBlock(
  type: BlogBlock["type"],
): BlogBlock {
  const id = newBlogBlockId();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "" };
    case "paragraph":
      return { id, type, text: "" };
    case "list":
      return { id, type, items: [""] };
    case "quote":
      return { id, type, text: "", attribution: "" };
    case "image":
      return {
        id,
        type,
        imagePath: "",
        alt: "",
        align: "center",
        size: "l",
      };
    case "video":
      return { id, type, url: "", videoPath: "", caption: "" };
  }
}
