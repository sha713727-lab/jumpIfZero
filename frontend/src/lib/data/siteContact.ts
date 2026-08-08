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
};

function toDetails(row: SiteContactPublic): SiteContactDetails {
  return {
    email: row.email,
    phone: row.phone,
    phoneHref: row.phoneHref,
    addressLabel: row.addressLabel,
    addressLines: row.addressLines,
    locationLede: row.locationLede,
    mapEmbedUrl: row.mapEmbedUrl,
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
