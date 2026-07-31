import {
  serviceChapters,
  servicesIntro,
} from "@/constants/servicesStory";

export type ServiceChapter = (typeof serviceChapters)[number];
export { serviceChapters, servicesIntro };

export async function getServiceChapters(): Promise<
  readonly ServiceChapter[]
> {
  return serviceChapters;
}
