import {
  teamIntro,
  teamMembers,
  type TeamMember,
  type TeamSocialNetwork,
} from "@/constants/team";

export type { TeamMember, TeamSocialNetwork };
export { teamIntro, teamMembers };

export async function getTeamMembers(): Promise<readonly TeamMember[]> {
  return teamMembers;
}
