import { compileRoute, type CompiledRoute, type RouteModule } from "./router.ts";

import * as healthLiveGet from "./api/health/live/get.ts";
import * as healthReadyGet from "./api/health/ready/get.ts";
import * as metricsGet from "./api/metrics/get.ts";

import * as authLoginPost from "./api/auth/login/post.ts";
import * as authRegisterPost from "./api/auth/register/post.ts";
import * as authLogoutPost from "./api/auth/logout/post.ts";
import * as authSessionValidatePost from "./api/auth/session/validate/post.ts";
import * as authPasswordForgotPost from "./api/auth/password/forgot/post.ts";
import * as authPasswordResetPost from "./api/auth/password/reset/post.ts";
import * as authPasswordChangePost from "./api/auth/password/change/post.ts";

import * as usersGet from "./api/users/get.ts";
import * as usersPost from "./api/users/post.ts";
import * as usersMeGet from "./api/users/me/get.ts";
import * as usersMePatch from "./api/users/me/patch.ts";
import * as usersIdGet from "./api/users/[id]/get.ts";
import * as usersIdPatch from "./api/users/[id]/patch.ts";
import * as usersIdArchivePost from "./api/users/[id]/archive/post.ts";
import * as usersIdRestorePost from "./api/users/[id]/restore/post.ts";
import * as usersIdRolePost from "./api/users/[id]/role/post.ts";
import * as usersIdPasswordPost from "./api/users/[id]/password/post.ts";

import * as employeesGet from "./api/employees/get.ts";
import * as employeesPost from "./api/employees/post.ts";
import * as employeesIdGet from "./api/employees/[id]/get.ts";
import * as employeesIdPatch from "./api/employees/[id]/patch.ts";
import * as employeesMeImagePatch from "./api/employees/me/image/patch.ts";
import * as employeesIdArchivePost from "./api/employees/[id]/archive/post.ts";
import * as employeesIdRestorePost from "./api/employees/[id]/restore/post.ts";
import * as employeesIdKindPost from "./api/employees/[id]/kind/post.ts";

import * as servicesGet from "./api/content/services/get.ts";
import * as servicesPost from "./api/content/services/post.ts";
import * as servicesIdGet from "./api/content/services/[id]/get.ts";
import * as servicesIdPatch from "./api/content/services/[id]/patch.ts";
import * as servicesIdDelete from "./api/content/services/[id]/delete.ts";
import * as servicesIdRestorePost from "./api/content/services/[id]/restore/post.ts";
import * as servicesBySlugGet from "./api/content/services/by-slug/[slug]/get.ts";

import * as portfolioGet from "./api/content/portfolio/get.ts";
import * as portfolioPost from "./api/content/portfolio/post.ts";
import * as portfolioIdGet from "./api/content/portfolio/[id]/get.ts";
import * as portfolioIdPatch from "./api/content/portfolio/[id]/patch.ts";
import * as portfolioIdDelete from "./api/content/portfolio/[id]/delete.ts";
import * as portfolioIdRestorePost from "./api/content/portfolio/[id]/restore/post.ts";
import * as portfolioBySlugGet from "./api/content/portfolio/by-slug/[slug]/get.ts";

import * as blogGet from "./api/content/blog/get.ts";
import * as blogPost from "./api/content/blog/post.ts";
import * as blogIdGet from "./api/content/blog/[id]/get.ts";
import * as blogIdPatch from "./api/content/blog/[id]/patch.ts";
import * as blogIdDelete from "./api/content/blog/[id]/delete.ts";
import * as blogIdRestorePost from "./api/content/blog/[id]/restore/post.ts";
import * as blogBySlugGet from "./api/content/blog/by-slug/[slug]/get.ts";

import * as faqsGet from "./api/content/faqs/get.ts";
import * as faqsPost from "./api/content/faqs/post.ts";
import * as faqsIdGet from "./api/content/faqs/[id]/get.ts";
import * as faqsIdPatch from "./api/content/faqs/[id]/patch.ts";
import * as faqsIdDelete from "./api/content/faqs/[id]/delete.ts";
import * as faqsIdRestorePost from "./api/content/faqs/[id]/restore/post.ts";
import * as faqsReorderPut from "./api/content/faqs/reorder/put.ts";

import * as siteGalleryGet from "./api/content/site-gallery/get.ts";
import * as siteGalleryPost from "./api/content/site-gallery/post.ts";
import * as siteGalleryIdGet from "./api/content/site-gallery/[id]/get.ts";
import * as siteGalleryIdPatch from "./api/content/site-gallery/[id]/patch.ts";
import * as siteGalleryIdDelete from "./api/content/site-gallery/[id]/delete.ts";
import * as siteGalleryIdRestorePost from "./api/content/site-gallery/[id]/restore/post.ts";
import * as siteGalleryReorderPut from "./api/content/site-gallery/reorder/put.ts";

import * as siteTestimonialsGet from "./api/content/site-testimonials/get.ts";
import * as siteTestimonialsPost from "./api/content/site-testimonials/post.ts";
import * as siteTestimonialsIdGet from "./api/content/site-testimonials/[id]/get.ts";
import * as siteTestimonialsIdPatch from "./api/content/site-testimonials/[id]/patch.ts";
import * as siteTestimonialsIdDelete from "./api/content/site-testimonials/[id]/delete.ts";
import * as siteTestimonialsIdRestorePost from "./api/content/site-testimonials/[id]/restore/post.ts";
import * as siteTestimonialsReorderPut from "./api/content/site-testimonials/reorder/put.ts";

import * as sitePrinciplesGet from "./api/content/site-principles/get.ts";
import * as sitePrinciplesPost from "./api/content/site-principles/post.ts";
import * as sitePrinciplesIdGet from "./api/content/site-principles/[id]/get.ts";
import * as sitePrinciplesIdPatch from "./api/content/site-principles/[id]/patch.ts";
import * as sitePrinciplesIdDelete from "./api/content/site-principles/[id]/delete.ts";
import * as sitePrinciplesIdRestorePost from "./api/content/site-principles/[id]/restore/post.ts";
import * as sitePrinciplesReorderPut from "./api/content/site-principles/reorder/put.ts";

import * as teamGet from "./api/content/team/get.ts";
import * as teamPost from "./api/content/team/post.ts";
import * as teamIdGet from "./api/content/team/[id]/get.ts";
import * as teamIdPatch from "./api/content/team/[id]/patch.ts";
import * as teamIdDelete from "./api/content/team/[id]/delete.ts";
import * as teamIdRestorePost from "./api/content/team/[id]/restore/post.ts";
import * as teamReorderPut from "./api/content/team/reorder/put.ts";

import * as contentMediaPost from "./api/content/media/post.ts";
import * as contentMediaGet from "./api/content/media/get.ts";

import * as contactMessagesPost from "./api/content/contact-messages/post.ts";
import * as contactMessagesGet from "./api/content/contact-messages/get.ts";
import * as contactMessagesIdGet from "./api/content/contact-messages/[id]/get.ts";
import * as contactMessagesIdPatch from "./api/content/contact-messages/[id]/patch.ts";
import * as contactMessagesIdDelete from "./api/content/contact-messages/[id]/delete.ts";
import * as contactMessagesIdRestorePost from "./api/content/contact-messages/[id]/restore/post.ts";

import * as siteContactGet from "./api/content/site-contact/get.ts";
import * as siteContactPatch from "./api/content/site-contact/patch.ts";

import * as callbacksPost from "./api/content/callbacks/post.ts";
import * as callbacksGet from "./api/content/callbacks/get.ts";
import * as callbacksIdGet from "./api/content/callbacks/[id]/get.ts";
import * as callbacksIdPatch from "./api/content/callbacks/[id]/patch.ts";
import * as callbacksIdDelete from "./api/content/callbacks/[id]/delete.ts";
import * as callbacksIdRestorePost from "./api/content/callbacks/[id]/restore/post.ts";

import * as clientsGet from "./api/clients/get.ts";
import * as clientsPost from "./api/clients/post.ts";
import * as clientsMeGet from "./api/clients/me/get.ts";
import * as clientsMePatch from "./api/clients/me/patch.ts";
import * as clientsIdGet from "./api/clients/[id]/get.ts";
import * as clientsIdPatch from "./api/clients/[id]/patch.ts";
import * as clientsIdArchivePost from "./api/clients/[id]/archive/post.ts";
import * as clientsIdRestorePost from "./api/clients/[id]/restore/post.ts";
import * as clientsIdAssignmentsGet from "./api/clients/[id]/assignments/get.ts";
import * as clientsIdAssignmentsPut from "./api/clients/[id]/assignments/put.ts";

import * as projectsGet from "./api/projects/get.ts";
import * as projectsPost from "./api/projects/post.ts";
import * as projectsIdGet from "./api/projects/[id]/get.ts";
import * as projectsIdPatch from "./api/projects/[id]/patch.ts";
import * as projectsIdStatusPost from "./api/projects/[id]/status/post.ts";
import * as projectsIdArchivePost from "./api/projects/[id]/archive/post.ts";
import * as projectsIdRestorePost from "./api/projects/[id]/restore/post.ts";

import * as invoicesGet from "./api/invoices/get.ts";
import * as invoicesPost from "./api/invoices/post.ts";
import * as invoicesIdGet from "./api/invoices/[id]/get.ts";
import * as invoicesIdPatch from "./api/invoices/[id]/patch.ts";
import * as invoicesIdArchivePost from "./api/invoices/[id]/archive/post.ts";
import * as invoicesIdRestorePost from "./api/invoices/[id]/restore/post.ts";

import * as salarySlipsGet from "./api/salary-slips/get.ts";
import * as salarySlipsPost from "./api/salary-slips/post.ts";
import * as salarySlipsIdGet from "./api/salary-slips/[id]/get.ts";
import * as salarySlipsIdPatch from "./api/salary-slips/[id]/patch.ts";
import * as salarySlipsIdArchivePost from "./api/salary-slips/[id]/archive/post.ts";
import * as salarySlipsIdRestorePost from "./api/salary-slips/[id]/restore/post.ts";

import * as messagesGet from "./api/messages/get.ts";
import * as messagesPost from "./api/messages/post.ts";
import * as messagesIdGet from "./api/messages/[id]/get.ts";
import * as messagesIdReadPost from "./api/messages/[id]/read/post.ts";
import * as messagesIdArchivePost from "./api/messages/[id]/archive/post.ts";
import * as messagesIdRestorePost from "./api/messages/[id]/restore/post.ts";

import * as filesGet from "./api/files/get.ts";
import * as filesPost from "./api/files/post.ts";
import * as filesIdGet from "./api/files/[id]/get.ts";
import * as filesIdDownloadGet from "./api/files/[id]/download/get.ts";
import * as filesIdArchivePost from "./api/files/[id]/archive/post.ts";
import * as filesIdRestorePost from "./api/files/[id]/restore/post.ts";

import * as carriersGet from "./api/carriers/get.ts";
import * as carriersPost from "./api/carriers/post.ts";
import * as carriersIdGet from "./api/carriers/[id]/get.ts";
import * as carriersIdPatch from "./api/carriers/[id]/patch.ts";
import * as carriersIdArchivePost from "./api/carriers/[id]/archive/post.ts";
import * as carriersIdRestorePost from "./api/carriers/[id]/restore/post.ts";
import * as carriersIdTaxIdGet from "./api/carriers/[id]/tax-id/get.ts";

import * as partiesGet from "./api/parties/get.ts";
import * as partiesPost from "./api/parties/post.ts";
import * as partiesIdGet from "./api/parties/[id]/get.ts";
import * as partiesIdPatch from "./api/parties/[id]/patch.ts";
import * as partiesIdArchivePost from "./api/parties/[id]/archive/post.ts";
import * as partiesIdRestorePost from "./api/parties/[id]/restore/post.ts";

import * as salesGet from "./api/sales/get.ts";
import * as salesPost from "./api/sales/post.ts";
import * as salesIdGet from "./api/sales/[id]/get.ts";
import * as salesIdPatch from "./api/sales/[id]/patch.ts";
import * as salesIdStatusPost from "./api/sales/[id]/status/post.ts";
import * as salesIdArchivePost from "./api/sales/[id]/archive/post.ts";
import * as salesIdRestorePost from "./api/sales/[id]/restore/post.ts";

import * as leadsGet from "./api/leads/get.ts";
import * as leadsPost from "./api/leads/post.ts";
import * as leadsIdGet from "./api/leads/[id]/get.ts";
import * as leadsIdPatch from "./api/leads/[id]/patch.ts";
import * as leadsIdStatusPost from "./api/leads/[id]/status/post.ts";
import * as leadsIdArchivePost from "./api/leads/[id]/archive/post.ts";
import * as leadsIdRestorePost from "./api/leads/[id]/restore/post.ts";

import * as leadFollowUpsGet from "./api/lead-follow-ups/get.ts";
import * as leadFollowUpsPost from "./api/lead-follow-ups/post.ts";
import * as leadFollowUpsIdPatch from "./api/lead-follow-ups/[id]/patch.ts";
import * as leadFollowUpsIdDelete from "./api/lead-follow-ups/[id]/delete.ts";

import * as salesMessagesGet from "./api/sales-messages/get.ts";
import * as salesMessagesPost from "./api/sales-messages/post.ts";
import * as salesMessagesIdReadPost from "./api/sales-messages/[id]/read/post.ts";
import * as salesMessagesIdDelete from "./api/sales-messages/[id]/delete.ts";

function mod(module: {
  readonly schema: RouteModule["schema"];
  readonly default: RouteModule["default"];
}): RouteModule {
  return module;
}

export const routes: readonly CompiledRoute[] = [
  compileRoute("GET", "/health/live", "health.live", mod(healthLiveGet)),
  compileRoute("GET", "/health/ready", "health.ready", mod(healthReadyGet)),
  compileRoute("GET", "/metrics", "metrics.get", mod(metricsGet)),

  compileRoute("POST", "/auth/login", "auth.login", mod(authLoginPost)),
  compileRoute(
    "POST",
    "/auth/register",
    "auth.register",
    mod(authRegisterPost),
  ),
  compileRoute("POST", "/auth/logout", "auth.logout", mod(authLogoutPost)),
  compileRoute(
    "POST",
    "/auth/session/validate",
    "auth.session.validate",
    mod(authSessionValidatePost),
  ),
  compileRoute(
    "POST",
    "/auth/password/forgot",
    "auth.password.forgot",
    mod(authPasswordForgotPost),
  ),
  compileRoute(
    "POST",
    "/auth/password/reset",
    "auth.password.reset",
    mod(authPasswordResetPost),
  ),
  compileRoute(
    "POST",
    "/auth/password/change",
    "auth.password.change",
    mod(authPasswordChangePost),
  ),

  compileRoute("GET", "/users", "users.list", mod(usersGet)),
  compileRoute("POST", "/users", "users.create", mod(usersPost)),
  compileRoute("GET", "/users/me", "users.me.get", mod(usersMeGet)),
  compileRoute("PATCH", "/users/me", "users.me.update", mod(usersMePatch)),
  compileRoute("GET", "/users/[id]", "users.get", mod(usersIdGet)),
  compileRoute("PATCH", "/users/[id]", "users.update", mod(usersIdPatch)),
  compileRoute(
    "POST",
    "/users/[id]/archive",
    "users.archive",
    mod(usersIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/users/[id]/restore",
    "users.restore",
    mod(usersIdRestorePost),
  ),
  compileRoute("POST", "/users/[id]/role", "users.role", mod(usersIdRolePost)),
  compileRoute(
    "POST",
    "/users/[id]/password",
    "users.password",
    mod(usersIdPasswordPost),
  ),

  compileRoute("GET", "/employees", "employees.list", mod(employeesGet)),
  compileRoute("POST", "/employees", "employees.create", mod(employeesPost)),
  compileRoute(
    "PATCH",
    "/employees/me/image",
    "employees.me.image",
    mod(employeesMeImagePatch),
  ),
  compileRoute("GET", "/employees/[id]", "employees.get", mod(employeesIdGet)),
  compileRoute(
    "PATCH",
    "/employees/[id]",
    "employees.update",
    mod(employeesIdPatch),
  ),
  compileRoute(
    "POST",
    "/employees/[id]/archive",
    "employees.archive",
    mod(employeesIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/employees/[id]/restore",
    "employees.restore",
    mod(employeesIdRestorePost),
  ),
  compileRoute(
    "POST",
    "/employees/[id]/kind",
    "employees.kind",
    mod(employeesIdKindPost),
  ),

  compileRoute("GET", "/content/services", "content.services.list", mod(servicesGet)),
  compileRoute("POST", "/content/services", "content.services.create", mod(servicesPost)),
  compileRoute(
    "GET",
    "/content/services/by-slug/[slug]",
    "content.services.bySlug",
    mod(servicesBySlugGet),
  ),
  compileRoute("GET", "/content/services/[id]", "content.services.get", mod(servicesIdGet)),
  compileRoute(
    "PATCH",
    "/content/services/[id]",
    "content.services.update",
    mod(servicesIdPatch),
  ),
  compileRoute(
    "DELETE",
    "/content/services/[id]",
    "content.services.archive",
    mod(servicesIdDelete),
  ),
  compileRoute(
    "POST",
    "/content/services/[id]/restore",
    "content.services.restore",
    mod(servicesIdRestorePost),
  ),

  compileRoute("GET", "/content/portfolio", "content.portfolio.list", mod(portfolioGet)),
  compileRoute("POST", "/content/portfolio", "content.portfolio.create", mod(portfolioPost)),
  compileRoute(
    "GET",
    "/content/portfolio/by-slug/[slug]",
    "content.portfolio.bySlug",
    mod(portfolioBySlugGet),
  ),
  compileRoute("GET", "/content/portfolio/[id]", "content.portfolio.get", mod(portfolioIdGet)),
  compileRoute(
    "PATCH",
    "/content/portfolio/[id]",
    "content.portfolio.update",
    mod(portfolioIdPatch),
  ),
  compileRoute(
    "DELETE",
    "/content/portfolio/[id]",
    "content.portfolio.archive",
    mod(portfolioIdDelete),
  ),
  compileRoute(
    "POST",
    "/content/portfolio/[id]/restore",
    "content.portfolio.restore",
    mod(portfolioIdRestorePost),
  ),

  compileRoute("GET", "/content/blog", "content.blog.list", mod(blogGet)),
  compileRoute("POST", "/content/blog", "content.blog.create", mod(blogPost)),
  compileRoute(
    "GET",
    "/content/blog/by-slug/[slug]",
    "content.blog.bySlug",
    mod(blogBySlugGet),
  ),
  compileRoute("GET", "/content/blog/[id]", "content.blog.get", mod(blogIdGet)),
  compileRoute("PATCH", "/content/blog/[id]", "content.blog.update", mod(blogIdPatch)),
  compileRoute("DELETE", "/content/blog/[id]", "content.blog.archive", mod(blogIdDelete)),
  compileRoute(
    "POST",
    "/content/blog/[id]/restore",
    "content.blog.restore",
    mod(blogIdRestorePost),
  ),

  compileRoute("GET", "/content/faqs", "content.faqs.list", mod(faqsGet)),
  compileRoute("POST", "/content/faqs", "content.faqs.create", mod(faqsPost)),
  compileRoute("GET", "/content/faqs/[id]", "content.faqs.get", mod(faqsIdGet)),
  compileRoute("PATCH", "/content/faqs/[id]", "content.faqs.update", mod(faqsIdPatch)),
  compileRoute("DELETE", "/content/faqs/[id]", "content.faqs.archive", mod(faqsIdDelete)),
  compileRoute(
    "POST",
    "/content/faqs/[id]/restore",
    "content.faqs.restore",
    mod(faqsIdRestorePost),
  ),
  compileRoute(
    "PUT",
    "/content/faqs/reorder",
    "content.faqs.reorder",
    mod(faqsReorderPut),
  ),

  compileRoute("GET", "/content/site-gallery", "content.site-gallery.list", mod(siteGalleryGet)),
  compileRoute("POST", "/content/site-gallery", "content.site-gallery.create", mod(siteGalleryPost)),
  compileRoute("GET", "/content/site-gallery/[id]", "content.site-gallery.get", mod(siteGalleryIdGet)),
  compileRoute("PATCH", "/content/site-gallery/[id]", "content.site-gallery.update", mod(siteGalleryIdPatch)),
  compileRoute("DELETE", "/content/site-gallery/[id]", "content.site-gallery.archive", mod(siteGalleryIdDelete)),
  compileRoute(
    "POST",
    "/content/site-gallery/[id]/restore",
    "content.site-gallery.restore",
    mod(siteGalleryIdRestorePost),
  ),
  compileRoute(
    "PUT",
    "/content/site-gallery/reorder",
    "content.site-gallery.reorder",
    mod(siteGalleryReorderPut),
  ),

  compileRoute("GET", "/content/site-testimonials", "content.site-testimonials.list", mod(siteTestimonialsGet)),
  compileRoute("POST", "/content/site-testimonials", "content.site-testimonials.create", mod(siteTestimonialsPost)),
  compileRoute("GET", "/content/site-testimonials/[id]", "content.site-testimonials.get", mod(siteTestimonialsIdGet)),
  compileRoute("PATCH", "/content/site-testimonials/[id]", "content.site-testimonials.update", mod(siteTestimonialsIdPatch)),
  compileRoute("DELETE", "/content/site-testimonials/[id]", "content.site-testimonials.archive", mod(siteTestimonialsIdDelete)),
  compileRoute(
    "POST",
    "/content/site-testimonials/[id]/restore",
    "content.site-testimonials.restore",
    mod(siteTestimonialsIdRestorePost),
  ),
  compileRoute(
    "PUT",
    "/content/site-testimonials/reorder",
    "content.site-testimonials.reorder",
    mod(siteTestimonialsReorderPut),
  ),

  compileRoute("GET", "/content/site-principles", "content.site-principles.list", mod(sitePrinciplesGet)),
  compileRoute("POST", "/content/site-principles", "content.site-principles.create", mod(sitePrinciplesPost)),
  compileRoute("GET", "/content/site-principles/[id]", "content.site-principles.get", mod(sitePrinciplesIdGet)),
  compileRoute("PATCH", "/content/site-principles/[id]", "content.site-principles.update", mod(sitePrinciplesIdPatch)),
  compileRoute("DELETE", "/content/site-principles/[id]", "content.site-principles.archive", mod(sitePrinciplesIdDelete)),
  compileRoute(
    "POST",
    "/content/site-principles/[id]/restore",
    "content.site-principles.restore",
    mod(sitePrinciplesIdRestorePost),
  ),
  compileRoute(
    "PUT",
    "/content/site-principles/reorder",
    "content.site-principles.reorder",
    mod(sitePrinciplesReorderPut),
  ),

  compileRoute("GET", "/content/team", "content.team.list", mod(teamGet)),
  compileRoute("POST", "/content/team", "content.team.create", mod(teamPost)),
  compileRoute("GET", "/content/team/[id]", "content.team.get", mod(teamIdGet)),
  compileRoute("PATCH", "/content/team/[id]", "content.team.update", mod(teamIdPatch)),
  compileRoute("DELETE", "/content/team/[id]", "content.team.archive", mod(teamIdDelete)),
  compileRoute(
    "POST",
    "/content/team/[id]/restore",
    "content.team.restore",
    mod(teamIdRestorePost),
  ),
  compileRoute(
    "PUT",
    "/content/team/reorder",
    "content.team.reorder",
    mod(teamReorderPut),
  ),

  compileRoute(
    "POST",
    "/content/media",
    "content.media.upload",
    mod(contentMediaPost),
  ),
  compileRoute("GET", "/content/media", "content.media.get", mod(contentMediaGet)),

  compileRoute(
    "POST",
    "/content/contact-messages",
    "content.contactMessages.create",
    mod(contactMessagesPost),
  ),
  compileRoute(
    "GET",
    "/content/contact-messages",
    "content.contactMessages.list",
    mod(contactMessagesGet),
  ),
  compileRoute(
    "GET",
    "/content/contact-messages/[id]",
    "content.contactMessages.get",
    mod(contactMessagesIdGet),
  ),
  compileRoute(
    "PATCH",
    "/content/contact-messages/[id]",
    "content.contactMessages.update",
    mod(contactMessagesIdPatch),
  ),
  compileRoute(
    "DELETE",
    "/content/contact-messages/[id]",
    "content.contactMessages.archive",
    mod(contactMessagesIdDelete),
  ),
  compileRoute(
    "POST",
    "/content/contact-messages/[id]/restore",
    "content.contactMessages.restore",
    mod(contactMessagesIdRestorePost),
  ),

  compileRoute(
    "GET",
    "/content/site-contact",
    "content.site-contact.get",
    mod(siteContactGet),
  ),
  compileRoute(
    "PATCH",
    "/content/site-contact",
    "content.site-contact.update",
    mod(siteContactPatch),
  ),

  compileRoute(
    "POST",
    "/content/callbacks",
    "content.callbacks.create",
    mod(callbacksPost),
  ),
  compileRoute(
    "GET",
    "/content/callbacks",
    "content.callbacks.list",
    mod(callbacksGet),
  ),
  compileRoute(
    "GET",
    "/content/callbacks/[id]",
    "content.callbacks.get",
    mod(callbacksIdGet),
  ),
  compileRoute(
    "PATCH",
    "/content/callbacks/[id]",
    "content.callbacks.update",
    mod(callbacksIdPatch),
  ),
  compileRoute(
    "DELETE",
    "/content/callbacks/[id]",
    "content.callbacks.archive",
    mod(callbacksIdDelete),
  ),
  compileRoute(
    "POST",
    "/content/callbacks/[id]/restore",
    "content.callbacks.restore",
    mod(callbacksIdRestorePost),
  ),

  compileRoute("GET", "/clients", "clients.list", mod(clientsGet)),
  compileRoute("POST", "/clients", "clients.create", mod(clientsPost)),
  compileRoute("GET", "/clients/me", "clients.me.get", mod(clientsMeGet)),
  compileRoute("PATCH", "/clients/me", "clients.me.update", mod(clientsMePatch)),
  compileRoute("GET", "/clients/[id]", "clients.get", mod(clientsIdGet)),
  compileRoute("PATCH", "/clients/[id]", "clients.update", mod(clientsIdPatch)),
  compileRoute(
    "POST",
    "/clients/[id]/archive",
    "clients.archive",
    mod(clientsIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/clients/[id]/restore",
    "clients.restore",
    mod(clientsIdRestorePost),
  ),
  compileRoute(
    "GET",
    "/clients/[id]/assignments",
    "clients.assignments.list",
    mod(clientsIdAssignmentsGet),
  ),
  compileRoute(
    "PUT",
    "/clients/[id]/assignments",
    "clients.assignments.put",
    mod(clientsIdAssignmentsPut),
  ),

  compileRoute("GET", "/projects", "projects.list", mod(projectsGet)),
  compileRoute("POST", "/projects", "projects.create", mod(projectsPost)),
  compileRoute("GET", "/projects/[id]", "projects.get", mod(projectsIdGet)),
  compileRoute("PATCH", "/projects/[id]", "projects.update", mod(projectsIdPatch)),
  compileRoute(
    "POST",
    "/projects/[id]/status",
    "projects.status",
    mod(projectsIdStatusPost),
  ),
  compileRoute(
    "POST",
    "/projects/[id]/archive",
    "projects.archive",
    mod(projectsIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/projects/[id]/restore",
    "projects.restore",
    mod(projectsIdRestorePost),
  ),

  compileRoute("GET", "/invoices", "invoices.list", mod(invoicesGet)),
  compileRoute("POST", "/invoices", "invoices.create", mod(invoicesPost)),
  compileRoute("GET", "/invoices/[id]", "invoices.get", mod(invoicesIdGet)),
  compileRoute("PATCH", "/invoices/[id]", "invoices.update", mod(invoicesIdPatch)),
  compileRoute(
    "POST",
    "/invoices/[id]/archive",
    "invoices.archive",
    mod(invoicesIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/invoices/[id]/restore",
    "invoices.restore",
    mod(invoicesIdRestorePost),
  ),

  compileRoute("GET", "/salary-slips", "salarySlips.list", mod(salarySlipsGet)),
  compileRoute(
    "POST",
    "/salary-slips",
    "salarySlips.create",
    mod(salarySlipsPost),
  ),
  compileRoute(
    "GET",
    "/salary-slips/[id]",
    "salarySlips.get",
    mod(salarySlipsIdGet),
  ),
  compileRoute(
    "PATCH",
    "/salary-slips/[id]",
    "salarySlips.update",
    mod(salarySlipsIdPatch),
  ),
  compileRoute(
    "POST",
    "/salary-slips/[id]/archive",
    "salarySlips.archive",
    mod(salarySlipsIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/salary-slips/[id]/restore",
    "salarySlips.restore",
    mod(salarySlipsIdRestorePost),
  ),

  compileRoute("GET", "/messages", "messages.list", mod(messagesGet)),
  compileRoute("POST", "/messages", "messages.create", mod(messagesPost)),
  compileRoute("GET", "/messages/[id]", "messages.get", mod(messagesIdGet)),
  compileRoute(
    "POST",
    "/messages/[id]/read",
    "messages.read",
    mod(messagesIdReadPost),
  ),
  compileRoute(
    "POST",
    "/messages/[id]/archive",
    "messages.archive",
    mod(messagesIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/messages/[id]/restore",
    "messages.restore",
    mod(messagesIdRestorePost),
  ),

  compileRoute("GET", "/files", "files.list", mod(filesGet)),
  compileRoute("POST", "/files", "files.create", mod(filesPost)),
  compileRoute("GET", "/files/[id]", "files.get", mod(filesIdGet)),
  compileRoute(
    "GET",
    "/files/[id]/download",
    "files.download",
    mod(filesIdDownloadGet),
  ),
  compileRoute(
    "POST",
    "/files/[id]/archive",
    "files.archive",
    mod(filesIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/files/[id]/restore",
    "files.restore",
    mod(filesIdRestorePost),
  ),

  compileRoute("GET", "/carriers", "carriers.list", mod(carriersGet)),
  compileRoute("POST", "/carriers", "carriers.create", mod(carriersPost)),
  compileRoute("GET", "/carriers/[id]", "carriers.get", mod(carriersIdGet)),
  compileRoute("PATCH", "/carriers/[id]", "carriers.update", mod(carriersIdPatch)),
  compileRoute(
    "POST",
    "/carriers/[id]/archive",
    "carriers.archive",
    mod(carriersIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/carriers/[id]/restore",
    "carriers.restore",
    mod(carriersIdRestorePost),
  ),
  compileRoute(
    "GET",
    "/carriers/[id]/tax-id",
    "carriers.taxId",
    mod(carriersIdTaxIdGet),
  ),

  compileRoute("GET", "/parties", "parties.list", mod(partiesGet)),
  compileRoute("POST", "/parties", "parties.create", mod(partiesPost)),
  compileRoute("GET", "/parties/[id]", "parties.get", mod(partiesIdGet)),
  compileRoute("PATCH", "/parties/[id]", "parties.update", mod(partiesIdPatch)),
  compileRoute(
    "POST",
    "/parties/[id]/archive",
    "parties.archive",
    mod(partiesIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/parties/[id]/restore",
    "parties.restore",
    mod(partiesIdRestorePost),
  ),

  compileRoute("GET", "/sales", "sales.list", mod(salesGet)),
  compileRoute("POST", "/sales", "sales.create", mod(salesPost)),
  compileRoute("GET", "/sales/[id]", "sales.get", mod(salesIdGet)),
  compileRoute("PATCH", "/sales/[id]", "sales.update", mod(salesIdPatch)),
  compileRoute(
    "POST",
    "/sales/[id]/status",
    "sales.status",
    mod(salesIdStatusPost),
  ),
  compileRoute(
    "POST",
    "/sales/[id]/archive",
    "sales.archive",
    mod(salesIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/sales/[id]/restore",
    "sales.restore",
    mod(salesIdRestorePost),
  ),

  compileRoute("GET", "/leads", "leads.list", mod(leadsGet)),
  compileRoute("POST", "/leads", "leads.create", mod(leadsPost)),
  compileRoute("GET", "/leads/[id]", "leads.get", mod(leadsIdGet)),
  compileRoute("PATCH", "/leads/[id]", "leads.update", mod(leadsIdPatch)),
  compileRoute(
    "POST",
    "/leads/[id]/status",
    "leads.status",
    mod(leadsIdStatusPost),
  ),
  compileRoute(
    "POST",
    "/leads/[id]/archive",
    "leads.archive",
    mod(leadsIdArchivePost),
  ),
  compileRoute(
    "POST",
    "/leads/[id]/restore",
    "leads.restore",
    mod(leadsIdRestorePost),
  ),

  compileRoute(
    "GET",
    "/lead-follow-ups",
    "leadFollowUps.list",
    mod(leadFollowUpsGet),
  ),
  compileRoute(
    "POST",
    "/lead-follow-ups",
    "leadFollowUps.create",
    mod(leadFollowUpsPost),
  ),
  compileRoute(
    "PATCH",
    "/lead-follow-ups/[id]",
    "leadFollowUps.update",
    mod(leadFollowUpsIdPatch),
  ),
  compileRoute(
    "DELETE",
    "/lead-follow-ups/[id]",
    "leadFollowUps.delete",
    mod(leadFollowUpsIdDelete),
  ),

  compileRoute(
    "GET",
    "/sales-messages",
    "salesMessages.list",
    mod(salesMessagesGet),
  ),
  compileRoute(
    "POST",
    "/sales-messages",
    "salesMessages.create",
    mod(salesMessagesPost),
  ),
  compileRoute(
    "POST",
    "/sales-messages/[id]/read",
    "salesMessages.read",
    mod(salesMessagesIdReadPost),
  ),
  compileRoute(
    "DELETE",
    "/sales-messages/[id]",
    "salesMessages.delete",
    mod(salesMessagesIdDelete),
  ),
];
