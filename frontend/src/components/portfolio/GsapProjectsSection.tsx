"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PortfolioGsapProject } from "@/lib/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

const ACTIVE_NAME = "#5c6849";
const IDLE_NAME = "rgba(47,58,40,0.35)";

type ProjectCardProps = {
  readonly item: PortfolioGsapProject;
};

function ProjectCard({ item }: ProjectCardProps) {
  return (
    <article className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#e2e4de] shadow-[0_22px_50px_rgba(47,58,40,0.14)]">
        <Image
          src={item.img}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 45vw"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-2 px-1 md:px-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.66rem] font-extrabold tracking-[0.22em] text-logo-gradient uppercase">
              {item.leftText}
            </p>
            <h3 className="mt-2 text-[clamp(1.25rem,2.4vw,1.6rem)] leading-[1.15] font-extrabold tracking-[-0.03em] text-black">
              {item.title}
            </h3>
          </div>
          <Link
            href={item.link}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-logo-gradient px-5 py-2.5 text-[0.66rem] font-extrabold tracking-[0.18em] text-black uppercase transition-colors hover:bg-brand hover:text-cream focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          >
            Start
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="max-w-xl text-[0.95rem] leading-[1.55] font-medium text-[#2f3a28]/70">
          {item.description}
        </p>
      </div>
    </article>
  );
}

export type GsapProjectsSectionProps = {
  readonly projects: readonly PortfolioGsapProject[];
  readonly title: string;
  readonly lede?: string;
  readonly sectionRef?: RefObject<HTMLElement | null>;
};

export function GsapProjectsSection({
  projects,
  title,
  lede,
  sectionRef,
}: GsapProjectsSectionProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const totalProjectCount = projects.length;

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;

    if (sectionRef) {
      sectionRef.current = root;
    }

    if (!root || !pin || totalProjectCount === 0) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (window.innerWidth < 1024) {
      return;
    }

    const projectIndex = pin.querySelector(
      ".project-index h1",
    ) as HTMLElement | null;
    const projectImagesContainer = pin.querySelector(
      ".project-images",
    ) as HTMLElement | null;
    const projectNamesContainer = pin.querySelector(
      ".project-names",
    ) as HTMLElement | null;
    const projectNames = gsap.utils.toArray<HTMLElement>(
      pin.querySelectorAll(".project-names p"),
    );

    if (
      !projectIndex ||
      !projectImagesContainer ||
      !projectNamesContainer ||
      projectNames.length === 0
    ) {
      return;
    }

    let moveDistanceIndex = 0;
    let moveDistanceNames = 0;
    let moveDistanceImages = 0;

    const calculateMetrics = () => {
      const spotlightSectionHeight = pin.offsetHeight;
      const spotlightSectionPadding =
        parseFloat(getComputedStyle(pin).paddingTop) || 0;
      const projectIndexHeight = projectIndex.offsetHeight;
      const containerHeight = projectNamesContainer.offsetHeight;
      const imagesHeight = projectImagesContainer.offsetHeight;

      moveDistanceIndex =
        spotlightSectionHeight -
        spotlightSectionPadding * 2 -
        projectIndexHeight;
      moveDistanceNames =
        spotlightSectionHeight -
        spotlightSectionPadding * 2 -
        containerHeight;
      moveDistanceImages = Math.min(
        window.innerHeight - imagesHeight,
        -(imagesHeight - window.innerHeight * 0.7),
      );
    };

    calculateMetrics();
    ScrollTrigger.addEventListener("refreshInit", calculateMetrics);

    const trigger = ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: () => `+=${window.innerHeight * Math.max(2.4, totalProjectCount * 0.55)}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const currentIndex = Math.min(
          Math.floor(progress * totalProjectCount) + 1,
          totalProjectCount,
        );

        projectIndex.innerHTML = `${String(currentIndex).padStart(2, "0")}<span class="text-[1.75rem] tracking-tight font-extrabold text-logo-gradient">/${String(totalProjectCount).padStart(2, "0")}</span>`;

        gsap.set(projectIndex, { y: progress * moveDistanceIndex });
        gsap.set(projectImagesContainer, {
          y: progress * moveDistanceImages,
        });

        projectNames.forEach((node, index) => {
          const startProgress = index / totalProjectCount;
          const endProgress = (index + 1) / totalProjectCount;
          const projectProgress = Math.max(
            0,
            Math.min(
              1,
              (progress - startProgress) / (endProgress - startProgress),
            ),
          );

          gsap.set(node, {
            y: -projectProgress * moveDistanceNames,
            color:
              projectProgress > 0 && projectProgress < 1
                ? ACTIVE_NAME
                : IDLE_NAME,
          });
        });
      },
    });

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.clearTimeout(refreshTimer);
      ScrollTrigger.removeEventListener("refreshInit", calculateMetrics);
      trigger.kill();
      gsap.set(
        [projectIndex, projectImagesContainer, ...projectNames],
        { clearProps: "transform,color" },
      );
    };
  }, [projects, sectionRef, totalProjectCount]);

  return (
    <section
      ref={rootRef}
      id="works"
      aria-label={title}
      data-header-tone="light"
      data-header-bg="#f7f5f0"
      className="relative w-full overflow-hidden bg-cream text-black"
    >
      <div className="relative mx-auto w-full max-w-[1360px] px-5 pt-24 md:px-8 md:pt-32 lg:px-12 lg:pt-36">
        <div className="relative mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-4xl lg:text-left">
          <div className="relative flex items-center justify-center py-6 lg:justify-start lg:py-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2.4rem,8vw,5.5rem)] font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase select-none lg:left-0 lg:translate-x-0"
            >
              Work
            </span>
            <h2 className="relative z-[1] text-[clamp(1.55rem,3.4vw,2.55rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-black uppercase lg:text-[clamp(2rem,4.2vw,3.4rem)] lg:tracking-[-0.035em]">
              {title}
            </h2>
          </div>
          {lede ? (
            <p className="relative z-[1] mx-auto mt-1 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic lg:mx-0">
              {lede}
            </p>
          ) : null}
        </div>
      </div>

      <div
        ref={pinRef}
        className="relative mx-auto h-full min-h-svh w-full max-w-[1360px] px-5 pt-14 pb-10 md:px-8 md:pt-16 lg:px-12 lg:pt-24"
      >
        <div className="relative hidden items-center justify-between lg:flex">
          <div className="project-index z-50 text-brand">
            <h1 className="text-[clamp(5rem,12vw,8.75rem)] leading-none font-extrabold tracking-[-0.06em] text-brand">
              01
              <span className="text-[1.75rem] font-extrabold tracking-tight text-logo-gradient">
                /{String(totalProjectCount).padStart(2, "0")}
              </span>
            </h1>
          </div>
        </div>

        <div className="project-images absolute top-0 left-1/2 z-10 flex w-[min(45%,34rem)] -translate-x-1/2 flex-col gap-24 px-0 pt-[28svh] pb-[28svh] max-lg:static max-lg:mt-10 max-lg:w-full max-lg:translate-x-0 max-lg:gap-14 max-lg:py-0">
          {projects.map((item) => (
            <ProjectCard key={item.title} item={item} />
          ))}
        </div>

        <div className="project-names absolute right-8 bottom-8 hidden translate-y-4 flex-col gap-2 text-[1.15rem] whitespace-nowrap lg:flex">
          {projects.map((project) => (
            <p
              key={project.title}
              className="font-extrabold tracking-[-0.02em] text-[#2f3a28]/35"
            >
              {project.title}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
