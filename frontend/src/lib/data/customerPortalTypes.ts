import type { MessagePublic } from "@jumpifzero/contracts";

export type InvoiceStatus = "Due" | "Open" | "Paid";

export type CustomerUser = {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly email: string;
  readonly version: number;
};

export type CustomerClient = {
  readonly id: string;
  readonly company: string;
  readonly phone: string;
  readonly location: string;
  readonly clientContactTitle: string;
  readonly plan: string;
  readonly memberSince: string;
  readonly statusCode: "active" | "paused";
  readonly version: number;
};

export type CustomerShell = {
  readonly name: string;
  readonly company: string;
  readonly initials: string;
  readonly email: string;
  readonly plan: string;
  readonly memberSince: string;
  readonly status: string;
};

export type CustomerProject = {
  readonly id: string;
  readonly name: string;
  readonly service: string;
  readonly status: "In progress" | "Review" | "Requested" | "Completed";
  readonly progress: number;
  readonly manager: string;
  readonly updated: string;
  readonly updatedAt: string;
  readonly nextMilestone: string;
};

export type CustomerInvoice = {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly amount: string;
  readonly issued: string;
  readonly issuedOn: string | null;
  readonly due: string;
  readonly status: InvoiceStatus;
};

export type CustomerMessageAttachment = {
  readonly fileId: string;
  readonly name: string;
  readonly contentType: string;
  readonly sizeBytes: number;
};

export type CustomerMessage = {
  readonly id: string;
  readonly from: string;
  readonly role: string;
  readonly preview: string;
  readonly body: string;
  readonly time: string;
  readonly createdAt: string;
  readonly unread: boolean;
  readonly senderRole: MessagePublic["senderRole"];
  readonly attachments: readonly CustomerMessageAttachment[];
};

export type CustomerFile = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly size: string;
  readonly uploaded: string;
  readonly project: string;
};

export type CustomerMetric = {
  readonly id: "projects" | "invoices" | "messages" | "files" | "milestones";
  readonly label: string;
  readonly value: number;
  readonly detail: string;
  readonly tone: "brand" | "secondary" | "dark";
};

export type CustomerActivity = {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly href:
    | "/dashboard/projects"
    | "/dashboard/invoices"
    | "/dashboard/files"
    | "/dashboard/messages";
};

export type CustomerPortalBootstrap = {
  readonly user: CustomerUser;
  readonly client: CustomerClient;
  readonly shell: CustomerShell;
  readonly projects: readonly CustomerProject[];
  readonly invoices: readonly CustomerInvoice[];
  readonly messages: readonly CustomerMessage[];
  readonly files: readonly CustomerFile[];
};
