import Image from "next/image";
import {
  blogVideoEmbedSrc,
  type BlogBlock,
  type BlogImageAlign,
  type BlogImageSize,
} from "@/lib/blogBody";
import { cmsMediaSrc } from "@/lib/cmsMedia";

type BlogBodyRendererProps = {
  readonly blocks: readonly BlogBlock[];
};

function imageWidthClass(size: BlogImageSize, align: BlogImageAlign): string {
  if (align === "full" || size === "full") {
    return "w-full";
  }
  switch (size) {
    case "s":
      return "w-full max-w-[18rem]";
    case "m":
      return "w-full max-w-[28rem]";
    case "l":
      return "w-full max-w-[42rem]";
  }
}

function imageAlignClass(align: BlogImageAlign): string {
  switch (align) {
    case "left":
      return "mr-auto";
    case "right":
      return "ml-auto";
    case "center":
    case "full":
      return "mx-auto";
  }
}

function BlogBlockView({ block }: { readonly block: BlogBlock }) {
  switch (block.type) {
    case "heading": {
      if (block.level === 3) {
        return (
          <h3 className="text-[clamp(1.2rem,2.4vw,1.55rem)] font-extrabold tracking-[-0.02em] text-black">
            {block.text}
          </h3>
        );
      }
      return (
        <h2 className="text-[clamp(1.45rem,3vw,2rem)] font-extrabold tracking-[-0.025em] text-black">
          {block.text}
        </h2>
      );
    }
    case "paragraph":
      return (
        <p className="text-[1rem] leading-[1.75] font-medium text-black/70 md:text-[1.05rem]">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-6 text-[1rem] leading-[1.7] font-medium text-black/70 md:text-[1.05rem]">
          {block.items
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item, index) => (
              <li key={`${index}-${item.slice(0, 24)}`}>{item}</li>
            ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-brand/50 bg-white/60 px-5 py-4">
          <p className="text-[1.05rem] leading-[1.65] font-semibold tracking-[-0.01em] text-[#2f3a28] md:text-[1.15rem]">
            {block.text}
          </p>
          {block.attribution.trim() ? (
            <cite className="mt-3 block text-[0.82rem] font-bold tracking-[0.08em] text-black/45 not-italic uppercase">
              — {block.attribution}
            </cite>
          ) : null}
        </blockquote>
      );
    case "image": {
      if (!block.imagePath) {
        return null;
      }
      return (
        <figure
          className={`${imageWidthClass(block.size, block.align)} ${imageAlignClass(block.align)}`}
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#e2e4de] shadow-[0_18px_40px_rgba(47,58,40,0.1)]">
            <Image
              src={cmsMediaSrc(block.imagePath)}
              alt={block.alt || "Blog image"}
              fill
              className="object-cover"
              sizes="(max-width: 860px) 100vw, 860px"
              loading="lazy"
            />
          </div>
          {block.alt.trim() ? (
            <figcaption className="mt-3 text-center text-[0.82rem] font-medium text-black/45">
              {block.alt}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "video": {
      if (block.videoPath) {
        return (
          <figure className="w-full">
            <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#0d120b] shadow-[0_18px_40px_rgba(47,58,40,0.12)]">
              <video
                src={cmsMediaSrc(block.videoPath)}
                controls
                className="aspect-video w-full"
                preload="metadata"
              />
            </div>
            {block.caption.trim() ? (
              <figcaption className="mt-3 text-center text-[0.82rem] font-medium text-black/45">
                {block.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      }

      const embedSrc = blogVideoEmbedSrc(block.url);
      if (!embedSrc) {
        return null;
      }
      return (
        <figure className="w-full">
          <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#0d120b] shadow-[0_18px_40px_rgba(47,58,40,0.12)]">
            <iframe
              src={embedSrc}
              title={block.caption || "Blog video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {block.caption.trim() ? (
            <figcaption className="mt-3 text-center text-[0.82rem] font-medium text-black/45">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
  }
}

export function BlogBodyRenderer({ blocks }: BlogBodyRendererProps) {
  return (
    <div className="space-y-7">
      {blocks.map((block) => (
        <BlogBlockView key={block.id} block={block} />
      ))}
    </div>
  );
}
