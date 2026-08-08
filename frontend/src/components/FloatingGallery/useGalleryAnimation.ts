"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { GalleryItemData, GalleryLayoutConfig } from "./types";
import {
  GALLERY_SEED,
  createSeededRandom,
  depthScale,
  randomInRange,
  ribbonOpacity,
  sampleRibbon,
  wrap01,
} from "./utils";

gsap.registerPlugin(ScrollTrigger);

const COPY_FADE_IN_SHARE = 0.14;
const COPY_HOLD_SHARE = 0.72;
const COPY_FADE_OUT_SHARE = 0.14;
const COPY_DEPTH = 900;
const Z_INDEX_BASE = 2600;
const FLOAT_FRAME_SKIP = 2;

type UseGalleryAnimationParams = {
  readonly enabled: boolean;
  readonly stage: HTMLElement | null;
  readonly camera: HTMLElement | null;
  readonly copy: HTMLElement | null;
  readonly itemNodes: RefObject<Array<HTMLElement | null>>;
  readonly items: readonly GalleryItemData[];
  readonly config: GalleryLayoutConfig;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
};

type FloatPhase = {
  readonly speed: number;
  readonly ampX: number;
  readonly ampY: number;
  readonly seed: number;
};

type CachedSample = {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  opacity: number;
};

function applyItem(
  node: HTMLElement,
  item: GalleryItemData,
  sample: CachedSample,
  floatX: number,
  floatY: number,
): void {
  node.style.width = `${item.width}px`;
  node.style.height = `${item.height}px`;
  node.style.opacity = String(sample.opacity);
  node.style.zIndex = String(Math.round(Z_INDEX_BASE + sample.z));
  node.style.transform = `translate3d(${sample.x + floatX}px, ${sample.y + floatY}px, ${sample.z}px) translate(-50%, -50%) rotateX(${sample.rotateX}deg) rotateY(${sample.rotateY}deg) rotateZ(${sample.rotateZ}deg) scale(${sample.scale})`;
}

export function useGalleryAnimation({
  enabled,
  stage,
  camera,
  copy,
  itemNodes,
  items,
  config,
  viewportWidth,
  viewportHeight,
}: UseGalleryAnimationParams): void {
  useEffect(() => {
    if (!enabled || !stage || !camera || items.length === 0) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduceMotion = media.matches;
    const random = createSeededRandom(GALLERY_SEED + 23);
    const nodes = itemNodes.current.filter(
      (node): node is HTMLElement => node !== null,
    );

    if (nodes.length === 0) {
      return;
    }

    const floatPhase: FloatPhase[] = nodes.map(() => ({
      speed: randomInRange(random, 0.2, 0.45),
      ampX: randomInRange(random, 1.5, config.floatAmplitude),
      ampY: randomInRange(random, 2, config.floatAmplitude),
      seed: randomInRange(random, 0, Math.PI * 2),
    }));

    const samples: CachedSample[] = nodes.map(() => ({
      x: 0,
      y: 0,
      z: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      opacity: 0,
    }));

    const proxy = { progress: 0 };
    let lastProgress = -1;
    let active = false;
    let frame = 0;
    let tickerAttached = false;

    const recompute = (progress: number) => {
      nodes.forEach((_, index) => {
        const item = items[index];
        const sample = samples[index];
        if (!item || !sample) {
          return;
        }

        const t = wrap01(item.pathT + progress * config.pathTravel);
        const point = sampleRibbon(
          t,
          viewportWidth,
          viewportHeight,
          item.lane,
          config,
        );

        sample.x = point.x;
        sample.y = point.y;
        sample.z = point.z;
        sample.rotateX = point.rotateX;
        sample.rotateY = point.rotateY;
        sample.rotateZ = point.rotateZ;
        sample.scale = item.scale * depthScale(point.depthRatio);
        sample.opacity = ribbonOpacity(point.depthRatio);
      });

      lastProgress = progress;
    };

    const paint = (withFloat: boolean) => {
      const time = withFloat ? performance.now() / 1000 : 0;

      nodes.forEach((node, index) => {
        const item = items[index];
        const phase = floatPhase[index];
        const sample = samples[index];
        if (!item || !phase || !sample) {
          return;
        }

        const floatX =
          withFloat && !reduceMotion
            ? Math.sin(time * phase.speed + phase.seed) * phase.ampX
            : 0;
        const floatY =
          withFloat && !reduceMotion
            ? Math.cos(time * phase.speed * 0.85 + phase.seed) * phase.ampY
            : 0;

        applyItem(node, item, sample, floatX, floatY);
      });
    };

    const onTick = () => {
      if (!active || reduceMotion) {
        return;
      }

      frame += 1;
      if (frame % FLOAT_FRAME_SKIP !== 0) {
        return;
      }

      if (proxy.progress !== lastProgress) {
        recompute(proxy.progress);
      }

      paint(true);
    };

    const attachTicker = () => {
      if (tickerAttached || reduceMotion) {
        return;
      }

      gsap.ticker.add(onTick);
      tickerAttached = true;
    };

    const detachTicker = () => {
      if (!tickerAttached) {
        return;
      }

      gsap.ticker.remove(onTick);
      tickerAttached = false;
    };

    const ctx = gsap.context(() => {
      recompute(0);
      paint(false);

      if (reduceMotion) {
        if (copy) {
          gsap.set(copy, { opacity: 1, z: 0, clearProps: "transform" });
        }
        nodes.forEach((node, index) => {
          const sample = samples[index];
          if (!sample) {
            return;
          }
          sample.opacity = Math.max(sample.opacity, 0.85);
          node.style.opacity = String(sample.opacity);
        });
        return;
      }

      gsap.to(proxy, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: `+=${config.scrollDistance}`,
          pin: true,
          pinSpacing: true,
          pinType: "fixed",
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            active = true;
            attachTicker();
          },
          onEnterBack: () => {
            active = true;
            attachTicker();
          },
          onLeave: () => {
            active = false;
            detachTicker();
            recompute(proxy.progress);
            paint(false);
          },
          onLeaveBack: () => {
            active = false;
            detachTicker();
            recompute(proxy.progress);
            paint(false);
          },
          onUpdate: () => {
            if (!tickerAttached && proxy.progress !== lastProgress) {
              recompute(proxy.progress);
              paint(false);
            }
          },
        },
      });

      gsap.to(camera, {
        rotateY: 6,
        rotateX: -3,
        z: 80,
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: `+=${config.scrollDistance}`,
          scrub: 1.1,
        },
      });

      if (!copy) {
        return;
      }

      const copyTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: `+=${config.scrollDistance}`,
          scrub: 1.1,
        },
      });

      copyTimeline
        .fromTo(
          copy,
          { opacity: 0, z: -COPY_DEPTH },
          {
            opacity: 1,
            z: 0,
            duration: COPY_FADE_IN_SHARE,
            ease: "power2.out",
            force3D: true,
          },
        )
        .to(copy, { opacity: 1, duration: COPY_HOLD_SHARE })
        .to(copy, {
          opacity: 0,
          z: -COPY_DEPTH,
          duration: COPY_FADE_OUT_SHARE,
          ease: "power2.in",
          force3D: true,
        });
    }, stage);

    const rect = stage.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      active = true;
      attachTicker();
    }

    ScrollTrigger.refresh();

    return () => {
      detachTicker();
      ctx.revert();
    };
  }, [
    camera,
    config,
    copy,
    enabled,
    itemNodes,
    items,
    stage,
    viewportHeight,
    viewportWidth,
  ]);
}
