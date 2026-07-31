import {
  dashboardEmptyCopy,
  dashboardNav,
  demoFiles,
  demoInvoices,
  demoMessages,
  demoProjects,
  engagementMix,
  overviewCopy,
  overviewMetrics,
  profileCopy,
  progressSeries,
  recentActivity,
  supportCopy,
  type DashboardNavId,
  type InvoiceStatus,
} from "@/constants/dashboard";

export type DemoProject = (typeof demoProjects)[number];
export type DemoInvoice = (typeof demoInvoices)[number];
export type DemoMessage = (typeof demoMessages)[number];
export type DemoFile = (typeof demoFiles)[number];
export type { DashboardNavId, InvoiceStatus };

export {
  dashboardEmptyCopy,
  dashboardNav,
  demoFiles,
  demoInvoices,
  demoMessages,
  demoProjects,
  engagementMix,
  overviewCopy,
  overviewMetrics,
  profileCopy,
  progressSeries,
  recentActivity,
  supportCopy,
};

export async function getDemoProjects(): Promise<readonly DemoProject[]> {
  return demoProjects;
}

export async function getDemoInvoices(): Promise<readonly DemoInvoice[]> {
  return demoInvoices;
}

export async function getDemoMessages(): Promise<readonly DemoMessage[]> {
  return demoMessages;
}

export async function getDemoFiles(): Promise<readonly DemoFile[]> {
  return demoFiles;
}

export async function getOverviewMetrics() {
  return overviewMetrics;
}

export async function getRecentActivity() {
  return recentActivity;
}

export async function getProgressSeries() {
  return progressSeries;
}

export async function getEngagementMix() {
  return engagementMix;
}
