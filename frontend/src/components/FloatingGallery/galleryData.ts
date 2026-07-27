import type { AboutCopy, GalleryItemData, GalleryLayoutConfig } from "./types";
import {
  GALLERY_SEED,
  createSeededRandom,
  randomInRange,
  sampleRibbon,
} from "./utils";

const IMAGE_POOL = [
  "/images/hero-office.png",
  "/images/hero-team.png",
  "/images/hero-visual.png",
  "/images/welcome-hero.png",
  "/images/services/website.jpg",
  "/images/services/website-b.jpg",
  "/images/services/website-c.jpg",
  "/images/services/software.jpg",
  "/images/services/software-b.jpg",
  "/images/services/software-c.jpg",
  "/images/services/app.jpg",
  "/images/services/app-b.jpg",
  "/images/services/app-c.jpg",
  "/images/services/seo.jpg",
  "/images/services/seo-b.jpg",
  "/images/services/seo-c.jpg",
  "/images/services/smm.jpg",
  "/images/services/smm-b.jpg",
  "/images/services/smm-c.jpg",
  "/images/services/design.jpg",
  "/images/services/design-b.jpg",
  "/images/services/design-c.jpg",
  "/images/services/security.jpg",
  "/images/services/security-b.jpg",
  "/images/services/security-c.jpg",
  "/images/services/bugfix.jpg",
  "/images/services/bugfix-b.jpg",
  "/images/services/bugfix-c.jpg",
] as const;

const SIZE_PRESETS = [
  { width: 116, height: 155 },
  { width: 121, height: 161 },
  { width: 112, height: 150 },
  { width: 125, height: 166 },
  { width: 118, height: 158 },
] as const;

export const aboutCopy: AboutCopy = {
  watermark: "About Us",
  title: "JZ Enterprises",
  paragraphs: [
    "Our goal is to create holistic IT solutions tailored to your needs while attracting the ideal target audience to improve the reach of your online business.",
    "We design end-to-end digital systems around your goals — not generic templates. From strategy to launch, we build products that attract the right audience and turn attention into measurable growth.",
    "Technical excellence. Clear communication. Outcomes you can scale. That is how Jump If Zero works.",
  ],
  cta: {
    label: "About Us",
    href: "/#about",
  },
};

export function buildGalleryItems(
  config: GalleryLayoutConfig,
  viewportWidth: number,
  viewportHeight: number,
): GalleryItemData[] {
  const random = createSeededRandom(GALLERY_SEED);
  const items: GalleryItemData[] = [];
  const total = config.itemCount;

  for (let index = 0; index < total; index += 1) {
    const pathT = total <= 0 ? 0 : index / total;
    const lane = index % config.ribbonLanes;
    const sample = sampleRibbon(
      pathT,
      viewportWidth,
      viewportHeight,
      lane,
      config,
    );
    const size = SIZE_PRESETS[index % SIZE_PRESETS.length];
    const source = IMAGE_POOL[index % IMAGE_POOL.length];

    if (!size || !source) {
      continue;
    }

    items.push({
      id: `gallery-item-${index + 1}`,
      src: source,
      alt: "JZ Enterprises work",
      width: size.width,
      height: size.height,
      pathT,
      lane,
      translateX: sample.x,
      translateY: sample.y,
      translateZ: sample.z,
      rotationX: sample.rotateX,
      rotationY: sample.rotateY,
      rotationZ: sample.rotateZ,
      scale: randomInRange(random, config.minScale, config.maxScale),
    });
  }

  return items;
}
