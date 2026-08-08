import {
  dashboardEmptyCopy,
  dashboardNav,
  overviewCopy,
  profileCopy,
  supportCopy,
  type DashboardNavId,
} from "@/constants/dashboard";

export type { DashboardNavId };

export {
  dashboardEmptyCopy,
  dashboardNav,
  overviewCopy,
  profileCopy,
  supportCopy,
};

export type {
  CustomerActivity,
  CustomerClient,
  CustomerFile,
  CustomerInvoice,
  CustomerMessage,
  CustomerMetric,
  CustomerPortalBootstrap,
  CustomerProject,
  CustomerShell,
  CustomerUser,
  InvoiceStatus,
} from "@/lib/data/customerPortalTypes";

export {
  buildCustomerMetrics,
  buildRecentActivity,
} from "@/lib/data/customerPortalView";
