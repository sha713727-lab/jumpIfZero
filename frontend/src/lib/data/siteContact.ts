import { unstable_cache } from "next/cache";
import {
  siteContactPublicSchema,
  type SiteContactPublic,
} from "@jumpifzero/contracts/content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";

export type SiteContactDetails = {
  readonly email: string;
  readonly phone: string;
  readonly phoneHref: string;
  readonly addressLabel: string;
  readonly addressLines: readonly string[];
  readonly locationLede: string;
  readonly mapEmbedUrl: string;
  readonly socialLinkedinUrl: string;
  readonly socialInstagramUrl: string;
  readonly socialFacebookUrl: string;
  readonly socialXUrl: string;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatPakistanPhoneDisplay(phone: string): string {
  const digits = digitsOnly(phone);
  let national = digits;
  if (digits.startsWith("92") && digits.length >= 12) {
    national = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length >= 10) {
    national = digits.slice(1);
  }
  if (national.length === 10) {
    return `+92 ${national.slice(0, 3)}-${national.slice(3, 7)}-${national.slice(7)}`;
  }
  if (national.length > 0) {
    return `+92 ${national}`;
  }
  return phone.trim();
}

function formatPakistanPhoneHref(phone: string, phoneHref: string): string {
  const hrefDigits = digitsOnly(phoneHref);
  if (phoneHref.trim().toLowerCase().startsWith("tel:") && hrefDigits.length >= 11) {
    if (hrefDigits.startsWith("92")) {
      return `tel:+${hrefDigits}`;
    }
    if (hrefDigits.startsWith("0")) {
      return `tel:+92${hrefDigits.slice(1)}`;
    }
  }
  const digits = digitsOnly(phone);
  if (digits.startsWith("92") && digits.length >= 12) {
    return `tel:+${digits}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `tel:+92${digits.slice(1)}`;
  }
  if (digits.length >= 10) {
    return `tel:+92${digits}`;
  }
  const trimmed = phoneHref.trim();
  return trimmed.length > 0 ? trimmed : `tel:${phone.trim()}`;
}

function toDetails(row: SiteContactPublic): SiteContactDetails {
  return {
    email: row.email,
    phone: formatPakistanPhoneDisplay(row.phone),
    phoneHref: formatPakistanPhoneHref(row.phone, row.phoneHref),
    addressLabel: row.addressLabel,
    addressLines: row.addressLines,
    locationLede: row.locationLede,
    mapEmbedUrl: row.mapEmbedUrl,
    socialLinkedinUrl: row.socialLinkedinUrl.trim(),
    socialInstagramUrl: row.socialInstagramUrl.trim(),
    socialFacebookUrl: row.socialFacebookUrl.trim(),
    socialXUrl: row.socialXUrl.trim(),
  };
}

export async function getSiteContact(): Promise<SiteContactDetails> {
  return getCachedSiteContact();
}

const getCachedSiteContact = unstable_cache(
  async (): Promise<SiteContactDetails> => {
    const row = await gatewayBackendRequest({
      method: "GET",
      path: "/content/site-contact",
      outputSchema: siteContactPublicSchema,
    });
    return toDetails(row);
  },
  ["public-site-contact"],
  { revalidate: 60, tags: ["site-contact"] },
);
