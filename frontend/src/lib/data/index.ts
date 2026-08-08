export {
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
  type AdminSiteGalleryImage,
  type AdminSiteTestimonial,
  type AdminSitePrinciple,
  type EmployeeKind,
  type LeadStatus,
  type SaleStatus,
} from "@/lib/data/admin";

export {
  loadCustomerPortalBootstrap,
  buildCustomerMetrics,
  buildRecentActivity,
  type CustomerActivity,
  type CustomerClient,
  type CustomerFile,
  type CustomerInvoice,
  type CustomerMessage,
  type CustomerMetric,
  type CustomerPortalBootstrap,
  type CustomerProject,
  type CustomerShell,
  type CustomerUser,
  type InvoiceStatus,
} from "@/lib/data/customerPortal";

export {
  dashboardEmptyCopy,
  dashboardNav,
  overviewCopy,
  profileCopy,
  supportCopy,
  type DashboardNavId,
} from "@/lib/data/dashboard";

export {
  getBlogPosts,
  getBlogPost,
  getRelatedPosts,
  getBlogSlugs,
  blogCopy,
  type BlogPost,
} from "@/lib/data/blog";

export {
  getFaqItems,
  faqIntro,
  type FaqItem,
} from "@/lib/data/faqs";

export {
  getTeamMembers,
  teamIntro,
  type TeamMember,
  type TeamSocialNetwork,
} from "@/lib/data/team";

export {
  getServiceChapters,
  getServiceSlugs,
  servicesIntro,
  type ServiceChapter,
} from "@/lib/data/services";

export {
  getPortfolioProjects,
  getPortfolioBySlug,
  getPortfolioSlugs,
  portfolioCopy,
  portfolioMarqueeImages,
  type PortfolioGsapProject,
  type PortfolioDetail,
} from "@/lib/data/portfolio";

export {
  submitContactMessage,
  submitCallbackRequest,
  type PublicSubmitResult,
} from "@/lib/data/publicContent";
