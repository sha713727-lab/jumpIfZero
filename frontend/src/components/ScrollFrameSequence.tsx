"use client";

import { useEffect, useRef, useState } from "react";
import { heroCopy, site } from "@/constants/site";
import { applyHeaderTone } from "@/lib/headerTone";

const FRAME_DIR = "/images/JZ_Frames_30FPS";
const FRAME_COUNT = 239;
const FRAME_PAD = 4;
const SCROLL_DISTANCE = 4800;
const STRIDE_DESKTOP = 4;
const STRIDE_MOBILE = 8;
const STRIDE_SAVEDATA = 12;
const FILL_CONCURRENCY = 1;
const STRIDE_CONCURRENCY = 2;
const MAX_DPR_DESKTOP = 2;
const MAX_DPR_MOBILE = 1;
const CONTAIN_BELOW_ASPECT = 1;
const PORTRAIT_ZOOM = 1.5;
const LINE_IN = 0.05;
const LINE_OUT = 0.04;
const LINE_CUES: ReadonlyArray<{ enter: number | null; exit: number }> = [
  { enter: null, exit: 0.28 },
  { enter: 0.04, exit: 0.26 },
  { enter: 0.09, exit: 0.24 },
  { enter: 0.14, exit: 0.22 },
];
const FRAME_END = 0.78;
const GLOW_START = 0.76;
const GLOW_SPARK_SHARE = 0.06;
const WASH_START = 0.9;
const STAGE_BG = "#2f3a28";
const STORY_BG = "#f7f5f0";
const HEADER_BG = "#74815f";
const FRAME_VEIL = "rgba(47, 58, 40, 0.62)";
const LOGO_GRADIENT =
  "linear-gradient(172deg, #ffe27a 0%, #ffc250 32%, #ffa040 64%, #ef8a1f 100%)";

function frameSrc(index: number): string {
  return `${FRAME_DIR}/frame_${String(index).padStart(FRAME_PAD, "0")}.webp`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("frame"));
    image.src = src;
  });
}

function nearestFrame(
  frames: Array<HTMLImageElement | null>,
  index: number,
): HTMLImageElement | null {
  const target = Math.min(Math.max(Math.round(index), 0), frames.length - 1);
  const direct = frames[target];

  if (direct) {
    return direct;
  }

  for (let distance = 1; distance < frames.length; distance += 1) {
    const before = frames[target - distance];
    if (before) {
      return before;
    }

    const after = frames[target + distance];
    if (after) {
      return after;
    }
  }

  return null;
}

function connectionStride(): number {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  if (connection?.saveData) {
    return STRIDE_SAVEDATA;
  }

  if (
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  ) {
    return STRIDE_SAVEDATA;
  }

  if (connection?.effectiveType === "3g") {
    return STRIDE_MOBILE;
  }

  return window.matchMedia("(max-width: 767px)").matches
    ? STRIDE_MOBILE
    : STRIDE_DESKTOP;
}

async function loadIndices(
  frames: Array<HTMLImageElement | null>,
  indices: readonly number[],
  concurrency: number,
  onProgress: (loaded: number, total: number) => void,
  isCancelled: () => boolean,
  loadedStart: number,
  total: number,
): Promise<number> {
  let loaded = loadedStart;
  let cursor = 0;

  const worker = async () => {
    while (cursor < indices.length && !isCancelled()) {
      const index = indices[cursor];
      cursor += 1;

      if (index === undefined || frames[index]) {
        continue;
      }

      try {
        frames[index] = await loadImage(frameSrc(index));
        loaded += 1;
        onProgress(loaded, total);
      } catch {
        continue;
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, () => worker()),
  );

  return loaded;
}

function scheduleIdle(task: () => void): () => void {
  const ric = (
    window as Window & {
      requestIdleCallback?: (
        cb: IdleRequestCallback,
        opts?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    }
  ).requestIdleCallback;

  if (typeof ric === "function") {
    const id = ric(() => task(), { timeout: 1800 });
    return () => window.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(task, 400);
  return () => window.clearTimeout(id);
}

async function preloadFrames(
  onFirst: (frame: HTMLImageElement) => void,
  onProgress: (loaded: number, total: number) => void,
  isCancelled: () => boolean,
  frames: Array<HTMLImageElement | null>,
): Promise<void> {
  const first = await loadImage(frameSrc(0));

  if (isCancelled()) {
    return;
  }

  frames[0] = first;
  onFirst(first);
  onProgress(1, FRAME_COUNT);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    try {
      frames[FRAME_COUNT - 1] = await loadImage(frameSrc(FRAME_COUNT - 1));
    } catch {
      return;
    }
    onProgress(2, FRAME_COUNT);
    return;
  }

  const stride = connectionStride();
  const strideIndices: number[] = [];

  for (let index = stride; index < FRAME_COUNT; index += stride) {
    strideIndices.push(index);
  }

  if (strideIndices[strideIndices.length - 1] !== FRAME_COUNT - 1) {
    strideIndices.push(FRAME_COUNT - 1);
  }

  let loaded = await loadIndices(
    frames,
    strideIndices,
    STRIDE_CONCURRENCY,
    onProgress,
    isCancelled,
    1,
    FRAME_COUNT,
  );

  if (isCancelled()) {
    return;
  }

  const remainder: number[] = [];

  for (let index = 1; index < FRAME_COUNT; index += 1) {
    if (!frames[index]) {
      remainder.push(index);
    }
  }

  await new Promise<void>((resolve) => {
    const cancelIdle = scheduleIdle(() => {
      void loadIndices(
        frames,
        remainder,
        FILL_CONCURRENCY,
        onProgress,
        isCancelled,
        loaded,
        FRAME_COUNT,
      ).then(() => resolve());
    });

    if (isCancelled()) {
      cancelIdle();
      resolve();
    }
  });
}

function drawFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "medium";
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const canvasAspect = width / height;
  const fitWidth =
    canvasAspect < CONTAIN_BELOW_ASPECT && canvasAspect < imageAspect;
  const scale = fitWidth
    ? (width / image.naturalWidth) * PORTRAIT_ZOOM
    : Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  context.clearRect(0, 0, width, height);

  if (y > 0) {
    context.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      1,
      x,
      0,
      drawWidth,
      y + 1,
    );
    context.drawImage(
      image,
      0,
      image.naturalHeight - 1,
      image.naturalWidth,
      1,
      x,
      y + drawHeight - 1,
      drawWidth,
      height - y - drawHeight + 1,
    );
  }

  context.drawImage(image, x, y, drawWidth, drawHeight);
}

export function ScrollFrameSequence() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const welcomeRef = useRef<HTMLParagraphElement | null>(null);
  const markRef = useRef<HTMLHeadingElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const signatureRef = useRef<HTMLParagraphElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const washRef = useRef<HTMLDivElement | null>(null);
  const framesRef = useRef<Array<HTMLImageElement | null>>([]);
  const frameIndexRef = useRef(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    applyHeaderTone(false, HEADER_BG);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const frames: Array<HTMLImageElement | null> = Array.from(
      { length: FRAME_COUNT },
      () => null,
    );
    framesRef.current = frames;

    preloadFrames(
      (first) => {
        if (cancelled) {
          return;
        }

        frames[0] = first;
        setReady(true);
      },
      (loaded, total) => {
        if (!cancelled) {
          setLoadProgress(loaded / total);
        }
      },
      () => cancelled,
      frames,
    ).catch(() => {
      if (!cancelled) {
        setFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas || !ready || !framesRef.current[0]) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const proxy = { frame: 0 };
    const size = { width: 1, height: 1 };

    const syncHeader = (light = false) => {
      applyHeaderTone(light, light ? STORY_BG : HEADER_BG);
    };

    const paint = (index: number) => {
      const frame = nearestFrame(framesRef.current, index);
      if (!frame) {
        return;
      }
      frameIndexRef.current = Math.round(index);
      drawFrame(context, frame, size.width, size.height);
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        mobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP,
      );
      size.width = Math.max(1, Math.floor(rect.width));
      size.height = Math.max(1, Math.floor(window.innerHeight));
      canvas.width = Math.floor(size.width * dpr);
      canvas.height = Math.floor(size.height * dpr);
      canvas.style.width = `${size.width}px`;
      canvas.style.height = `${size.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(frameIndexRef.current);
    };

    resize();
    window.addEventListener("resize", resize);
    syncHeader();
    paint(0);

    const lines = [
      welcomeRef.current,
      markRef.current,
      taglineRef.current,
      signatureRef.current,
    ];

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        if (media.matches) {
          paint(FRAME_COUNT - 1);
          for (const line of lines) {
            if (line) {
              gsap.set(line, { opacity: 1, y: 0 });
            }
          }
          if (glowRef.current) {
            gsap.set(glowRef.current, { opacity: 1, scale: 1 });
          }
          if (washRef.current) {
            gsap.set(washRef.current, { opacity: 1 });
          }
          return;
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${SCROLL_DISTANCE}`,
            pin: true,
            scrub: 0.45,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: (self) => syncHeader(self.progress >= WASH_START),
            onEnterBack: (self) => syncHeader(self.progress >= WASH_START),
            onUpdate: (self) => {
              if (self.isActive) {
                syncHeader(self.progress >= WASH_START);
              }
            },
          },
        });

        timeline.to(
          proxy,
          {
            frame: FRAME_COUNT - 1,
            ease: "none",
            duration: FRAME_END,
            onUpdate: () => paint(proxy.frame),
          },
          0,
        );

        lines.forEach((line, index) => {
          if (!line) {
            return;
          }
          const cue = LINE_CUES[index];

          if (!cue) {
            return;
          }

          if (cue.enter === null) {
            gsap.fromTo(
              line,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
            );
          } else {
            gsap.set(line, { opacity: 0, y: 30 });
            timeline.to(
              line,
              {
                opacity: 1,
                y: 0,
                ease: "power2.out",
                duration: LINE_IN,
              },
              cue.enter,
            );
          }

          timeline.to(
            line,
            {
              opacity: 0,
              y: -26,
              ease: "power1.in",
              duration: LINE_OUT,
            },
            cue.exit,
          );
        });

        if (glowRef.current) {
          gsap.set(glowRef.current, {
            opacity: 0,
            scale: 0.02,
            transformOrigin: "50% 50%",
          });
          timeline
            .to(
              glowRef.current,
              {
                opacity: 1,
                scale: 0.12,
                ease: "power2.out",
                duration: GLOW_SPARK_SHARE,
              },
              GLOW_START,
            )
            .to(
              glowRef.current,
              {
                scale: 1,
                ease: "power2.in",
                duration: 1 - GLOW_START - GLOW_SPARK_SHARE,
              },
              GLOW_START + GLOW_SPARK_SHARE,
            );
        }

        if (veilRef.current) {
          timeline.to(
            veilRef.current,
            {
              backgroundColor: "rgba(47, 58, 40, 0.2)",
              ease: "power1.out",
              duration: 1 - GLOW_START,
            },
            GLOW_START,
          );
        }

        if (washRef.current) {
          gsap.set(washRef.current, { opacity: 0 });
          timeline.to(
            washRef.current,
            {
              opacity: 1,
              ease: "none",
              duration: 1 - WASH_START,
            },
            WASH_START,
          );
        }

        paint(0);
      }, section);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      ctx?.revert();
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="JZ Enterprises"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: STAGE_BG }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      <div
        ref={veilRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[6]"
        style={{
          backgroundColor: ready ? FRAME_VEIL : STAGE_BG,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[7] flex items-center justify-center"
      >
        <div
          ref={glowRef}
          className="aspect-square h-[240vmax] w-[240vmax] shrink-0 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 34%, rgba(255,255,255,0.7) 46%, rgba(255,255,255,0.25) 58%, rgba(255,255,255,0) 70%)",
          }}
        />
      </div>

      <div
        ref={washRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[8] opacity-0"
        style={{ backgroundColor: STORY_BG }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex h-full flex-col items-center justify-center px-6 pt-24 pb-24 text-center">
        <p
          ref={welcomeRef}
          className="text-[clamp(1.2rem,4.3vw,3.25rem)] font-semibold tracking-[0.44em] text-[#f7f5f0]/75 uppercase opacity-0"
        >
          {heroCopy.welcome}
        </p>

        <div className="mt-4 inline-block">
          <h1
            ref={markRef}
            className="bg-clip-text text-[clamp(2.4rem,8.6vw,6.5rem)] leading-[0.98] font-extrabold tracking-[0.01em] text-transparent uppercase opacity-0"
            style={{ backgroundImage: LOGO_GRADIENT }}
          >
            {`${heroCopy.headlineLead} ${heroCopy.headlineRest}`}
          </h1>
          <p
            ref={taglineRef}
            className="mt-2 text-right text-[clamp(0.72rem,2vw,1.15rem)] font-semibold tracking-[0.3em] text-white uppercase opacity-0"
          >
            {site.tagline}
          </p>
        </div>

        <p
          ref={signatureRef}
          className="absolute inset-x-0 bottom-12 px-6 text-[clamp(0.85rem,1.9vw,1.15rem)] font-medium tracking-[0.12em] text-[#f7f5f0]/80 italic opacity-0"
        >
          {heroCopy.signature}
        </p>
      </div>

      {!ready && !failed ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-2 px-6">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-logo-gradient transition-[width] duration-200 ease-out"
              style={{ width: `${Math.round(loadProgress * 100)}%` }}
            />
          </div>
          <p className="text-[10px] tracking-[0.2em] text-[#f7f5f0]/55 uppercase">
            {Math.round(loadProgress * 100)}%
          </p>
        </div>
      ) : null}

      {failed ? (
        <div
          className="absolute inset-0 z-[5]"
          style={{ backgroundColor: STAGE_BG }}
          aria-hidden="true"
        />
      ) : null}
    </section>
  );
}
