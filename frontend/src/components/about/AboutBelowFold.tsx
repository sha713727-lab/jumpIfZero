"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { TeamDetailModal } from "@/components/about/TeamDetailModal";
import {
  PinRotateSection,
  PinRotateSections,
} from "@/components/scroll/PinRotateSections";
import { aboutCopy } from "@/constants/about";
import { aboutFlowCopy } from "@/constants/aboutFlow";
import { teamIntro } from "@/constants/team";
import type { TeamMember } from "@/lib/data/team";

const CREAM_BG = "#f7f5f0";

const ImagesFlow = dynamic(
  () =>
    import("@/components/scroll/ImagesFlow").then((mod) => ({
      default: mod.ImagesFlow,
    })),
  {
    loading: () => (
      <section
        className="min-h-[100svh] bg-[#f3f5ef] [content-visibility:auto] [contain-intrinsic-size:1px_100svh]"
        aria-hidden="true"
      />
    ),
  },
);

const TeamMemberCard = dynamic(
  () =>
    import("@/components/about/TeamMemberCard").then((mod) => ({
      default: mod.TeamMemberCard,
    })),
  {
    loading: () => (
      <div
        className="min-h-[18rem] [content-visibility:auto] [contain-intrinsic-size:1px_18rem]"
        aria-hidden="true"
      />
    ),
  },
);

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] ?? name;
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

const PRINCIPLE_SECTION = {
  brand: {
    surface: "bg-brand text-cream",
    bar: "bg-logo-gradient",
    title: "text-cream",
    body: "text-cream/75",
    border: "border-white/10",
  },
  secondary: {
    surface: "bg-logo-gradient text-black",
    bar: "bg-[#2f3a28]",
    title: "text-black",
    body: "text-black/70",
    border: "border-black/10",
  },
} as const;

export function AboutBelowFold({
  members,
  studioImages,
  principles,
}: Readonly<{
  members: readonly TeamMember[];
  studioImages: readonly string[];
  principles: readonly import("@/lib/data/siteSections").SitePrinciple[];
}>) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <>
      <ImagesFlow
        flowWatermark={aboutFlowCopy.flowWatermark}
        flowTitle={aboutFlowCopy.flowTitle}
        flowParagraphs={aboutFlowCopy.flowParagraphs}
        flowCtaLabel={aboutFlowCopy.flowCtaLabel}
        flowCtaHref={aboutFlowCopy.flowCtaHref}
        images={studioImages}
      />

      <section
        aria-label="How we work"
        data-header-tone="light"
        data-header-bg={CREAM_BG}
      >
        <div className="bg-cream px-5 pt-12 pb-8 md:px-8 md:pt-20 md:pb-10">
          <div className="relative mx-auto w-full max-w-[1360px]">
            <p
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 left-0 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase"
            >
              Work
            </p>
            <h2 className="relative text-[clamp(1.55rem,3.4vw,2.55rem)] font-extrabold tracking-[-0.02em] text-black uppercase">
              {aboutCopy.principlesTitle}
            </h2>
            <p className="relative mt-4 max-w-xl text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic">
              {aboutCopy.principlesLede}
            </p>
          </div>
        </div>

        <PinRotateSections>
          {principles.map((principle) => {
            const theme = PRINCIPLE_SECTION[principle.accent];

            return (
              <PinRotateSection
                key={`${principle.index}-${principle.title}`}
                className={`${theme.surface} ${theme.border}`}
              >
                <div className="relative z-[1] flex shrink-0 justify-center self-center">
                  <Image
                    src="/images/jumpIfZeroLogo.png"
                    alt=""
                    aria-hidden="true"
                    width={413}
                    height={414}
                    className="h-[clamp(7rem,20vw,13rem)] w-auto object-contain"
                  />
                </div>
                <div className="relative z-[1] mt-6 w-full md:mt-0 md:w-[60%] md:flex md:flex-col md:items-start md:justify-start">
                  <div
                    aria-hidden="true"
                    className={`mb-5 h-1 w-12 rounded-full md:mb-8 ${theme.bar}`}
                  />
                  <h3
                    className={`mb-4 text-[clamp(1.55rem,4vw,2.55rem)] font-extrabold tracking-[-0.02em] md:mb-8 ${theme.title}`}
                  >
                    {principle.title}
                  </h3>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.75rem] bg-[#e2e4de]">
                    <Image
                      src={principle.image}
                      alt={principle.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 90vw, 60vw"
                    />
                  </div>
                  <p
                    className={`mt-4 max-w-[36rem] text-[0.95rem] leading-[1.65] font-medium md:mt-6 md:text-[1.02rem] ${theme.body}`}
                  >
                    {principle.body}
                  </p>
                </div>
              </PinRotateSection>
            );
          })}
        </PinRotateSections>
      </section>

      <section
        aria-label="Meet our team"
        data-header-tone="light"
        data-header-bg={CREAM_BG}
        className="bg-cream px-5 py-12 md:px-8 md:py-20"
      >
        <div className="mx-auto w-full max-w-[1360px]">
          <div className="relative mb-6 max-w-2xl md:mb-10">
            <p
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 left-0 select-none text-[clamp(2.4rem,8vw,5.5rem)] leading-none font-extrabold tracking-[0.08em] text-logo-gradient opacity-20 uppercase"
            >
              {teamIntro.watermark}
            </p>
            <h2 className="relative text-[clamp(1.55rem,3.4vw,2.55rem)] font-extrabold tracking-[-0.02em] text-black uppercase">
              {teamIntro.title}
            </h2>
            {teamIntro.lines[0] ? (
              <p className="relative mt-4 text-[clamp(0.95rem,1.8vw,1.12rem)] leading-[1.55] font-medium text-black/55 italic">
                {teamIntro.lines[0]}
              </p>
            ) : null}
          </div>

          <div className="mt-4 md:mt-8">
            {members.map((member, index) => {
              const { firstName, lastName } = splitName(member.name);

              return (
                <TeamMemberCard
                  key={member.name}
                  position={index % 2 === 0 ? "left" : "right"}
                  jobPosition={member.role}
                  firstName={firstName}
                  lastName={lastName}
                  imageUrl={member.image}
                  description={member.description}
                  accent={member.accent}
                  socials={member.socials}
                  onOpenDetail={() => setSelectedMember(member)}
                />
              );
            })}
          </div>
        </div>
      </section>

      <TeamDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
