export {
  getAdminDemoState,
  getClients,
  getProjects,
  getInvoices,
  getMessages,
  getFiles,
  getSales,
  getLeads,
  getEmployees,
  initialAdminDemoState,
  type AdminBlogPost,
  type AdminCallback,
  type AdminClient,
  type AdminContactMessage,
  type AdminDemoState,
  type AdminEmployee,
  type AdminFaq,
  type AdminFile,
  type AdminInvoice,
  type AdminLead,
  type AdminLeadFollowUp,
  type AdminMessage,
  type AdminPortfolioItem,
  type AdminProject,
  type AdminSale,
  type AdminSalesMessage,
  type AdminService,
  type AdminTeamMember,
  type EmployeeKind,
  type LeadStatus,
  type SaleStatus,
} from "@/lib/data/admin";

export {
  getDemoCustomer,
  demoCustomer,
  type DemoCustomer,
} from "@/lib/data/customer";

export {
  getDemoProjects,
  getDemoInvoices,
  getDemoMessages,
  getDemoFiles,
  getOverviewMetrics,
  getRecentActivity,
  getProgressSeries,
  getEngagementMix,
  dashboardEmptyCopy,
  dashboardNav,
  demoProjects,
  demoInvoices,
  demoMessages,
  demoFiles,
  overviewCopy,
  overviewMetrics,
  profileCopy,
  progressSeries,
  recentActivity,
  engagementMix,
  supportCopy,
  type DashboardNavId,
  type InvoiceStatus,
  type DemoProject,
  type DemoInvoice,
  type DemoMessage,
  type DemoFile,
} from "@/lib/data/dashboard";

export {
  getBlogPosts,
  getBlogPost,
  getRelatedPosts,
  blogCopy,
  blogPosts,
  type BlogPost,
} from "@/lib/data/blog";

export {
  getTeamMembers,
  teamIntro,
  teamMembers,
  type TeamMember,
  type TeamSocialNetwork,
} from "@/lib/data/team";

export {
  getServiceChapters,
  serviceChapters,
  servicesIntro,
  type ServiceChapter,
} from "@/lib/data/services";

export {
  getPortfolioProjects,
  portfolioCopy,
  portfolioMarqueeImages,
  portfolioProjects,
  type PortfolioGsapProject,
} from "@/lib/data/portfolio";
