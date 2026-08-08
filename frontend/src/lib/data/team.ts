import { unstable_cache } from "next/cache";
import {
  teamListResponseSchema,
} from "@jumpifzero/contracts/content";
import type { TeamMemberWithSocialsRow } from "@jumpifzero/contracts/db-content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import { teamIntro } from "@/constants/team";

export type TeamSocialNetwork = "linkedin" | "instagram" | "x";

export type TeamMember = {
  readonly name: string;
  readonly role: string;
  readonly image: string;
  readonly accent: "brand" | "secondary" | "dark";
  readonly description: string;
  readonly focus: string;
  readonly highlights: readonly string[];
  readonly socials: readonly {
    readonly label: string;
    readonly href: string;
    readonly network: TeamSocialNetwork;
  }[];
};

export { teamIntro };

const ACCENTS = ["brand", "secondary", "dark"] as const;

function toHighlights(bio: string): readonly string[] {
  const sentences = bio
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (sentences.length >= 3) {
    return sentences.slice(0, 3);
  }
  return sentences.length > 0 ? sentences : [bio];
}

function toTeamMember(row: TeamMemberWithSocialsRow, index: number): TeamMember {
  return {
    name: row.name,
    role: row.role_title,
    image: cmsMediaSrc(row.image_path),
    accent: ACCENTS[index % ACCENTS.length] ?? "brand",
    description: row.bio,
    focus: row.bio.split(/(?<=[.!?])\s+/)[0]?.trim() ?? row.bio,
    highlights: toHighlights(row.bio),
    socials: row.socials.map((social) => ({
      label: social.label,
      href: social.href,
      network: social.network,
    })),
  };
}

export const getTeamMembers = unstable_cache(
  async (): Promise<readonly TeamMember[]> => {
    const response = await gatewayBackendRequest({
      method: "GET",
      path: "/content/team",
      query: {
        limit: "100",
        publishedOnly: "true",
        sort: "sort_order",
        dir: "asc",
      },
      outputSchema: teamListResponseSchema,
    });
    return response.items.map(toTeamMember);
  },
  ["public-team-members"],
  { revalidate: 60 },
);
