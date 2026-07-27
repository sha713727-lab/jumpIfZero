"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { applyHeaderTone } from "@/lib/headerTone";
import { GalleryItem } from "./GalleryItem";
import { aboutCopy, buildGalleryItems } from "./galleryData";
import styles from "./gallery.module.css";
import { useGalleryAnimation } from "./useGalleryAnimation";
import { resolveLayoutConfig, resolveViewport } from "./utils";

const RESIZE_DEBOUNCE_MS = 160;
const MOUNT_ROOT_MARGIN = "80px 0px";

export function FloatingGallery() {
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);
  const [cameraEl, setCameraEl] = useState<HTMLDivElement | null>(null);
  const [copyEl, setCopyEl] = useState<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [ready, setReady] = useState(false);
  const [nearView, setNearView] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let timer = 0;

    const sync = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      setReady(true);
    };

    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(sync, RESIZE_DEBOUNCE_MS);
    };

    sync();
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearView(true);
          mountObserver.disconnect();
        }
      },
      { rootMargin: MOUNT_ROOT_MARGIN, threshold: 0 },
    );

    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "0px", threshold: 0 },
    );

    mountObserver.observe(section);
    viewObserver.observe(section);

    return () => {
      mountObserver.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  const viewport = useMemo(
    () => resolveViewport(viewportWidth, viewportHeight),
    [viewportHeight, viewportWidth],
  );

  const config = useMemo(() => resolveLayoutConfig(viewport), [viewport]);

  const items = useMemo(() => {
    if (!ready || !nearView) {
      return [];
    }

    return buildGalleryItems(config, viewportWidth, viewportHeight);
  }, [config, nearView, ready, viewportHeight, viewportWidth]);

  const setItemRef = useCallback((index: number, node: HTMLElement | null) => {
    itemRefs.current[index] = node;
  }, []);

  useGalleryAnimation({
    enabled: ready && nearView && items.length > 0,
    stage: stageEl,
    camera: cameraEl,
    copy: copyEl,
    itemNodes: itemRefs,
    items,
    config,
    viewportWidth,
    viewportHeight,
  });

  useEffect(() => {
    if (!stageEl || !nearView) {
      return;
    }

    const syncHeader = () => {
      const rect = stageEl.getBoundingClientRect();
      if (rect.top <= 72 && rect.bottom > 72) {
        applyHeaderTone(true, "#f7f5f0");
      }
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    return () => window.removeEventListener("scroll", syncHeader);
  }, [nearView, stageEl]);

  const stageClass = viewport.isMobile
    ? `${styles.stage} ${styles.stageMobile}`
    : viewport.isTablet
      ? `${styles.stage} ${styles.stageTablet}`
      : styles.stage;

  return (
    <section
      ref={sectionRef}
      id="about"
      className={styles.section}
      aria-label="About JZ Enterprises"
      data-active={inView ? "1" : "0"}
    >
      <div ref={setStageEl} className={stageClass}>
        <div className={styles.scene}>
          <div
            ref={setCameraEl}
            className={styles.camera}
            style={{ visibility: inView ? "visible" : "hidden" }}
          >
            {items.map((item, index) => (
              <GalleryItem
                key={item.id}
                item={item}
                itemRef={(node) => setItemRef(index, node)}
              />
            ))}
          </div>
        </div>

        <div className={styles.veil} aria-hidden="true" />

        <div
          className={styles.copy}
          style={{ visibility: inView ? "visible" : "hidden" }}
        >
          <div ref={setCopyEl} className={styles.copyInner}>
            <div className={styles.headingStack}>
              <span className={styles.watermark} aria-hidden="true">
                {aboutCopy.watermark}
              </span>
              <h2 className={styles.title}>{aboutCopy.title}</h2>
            </div>
            {aboutCopy.paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}

            <Link href={aboutCopy.cta.href} className={styles.cta}>
              {aboutCopy.cta.label}
              <span className={styles.ctaIcon} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
