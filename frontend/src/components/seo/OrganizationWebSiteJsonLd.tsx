import { site } from "@/constants/site";
import { getSiteContact } from "@/lib/data/siteContact";
import { env } from "@/lib/env";
import { formatStreetAddress, formatTelephone } from "@/lib/seo/nap";

export async function OrganizationWebSiteJsonLd() {
  const contact = await getSiteContact();
  const streetAddress = formatStreetAddress(contact.addressLines);
  const telephone = formatTelephone(contact.phoneHref, contact.phone);
  const organizationId = `${env.siteUrl}/#organization`;

  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        alternateName: site.tagline,
        legalName: site.legalName,
        url: env.siteUrl,
        description: site.description,
        email: contact.email,
        telephone,
        address: {
          "@type": "PostalAddress",
          streetAddress,
          addressLocality: "Lahore",
          addressRegion: "Punjab",
          addressCountry: "PK",
        },
        areaServed: {
          "@type": "Country",
          name: "Pakistan",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${env.siteUrl}/#website`,
        url: env.siteUrl,
        name: site.name,
        alternateName: site.tagline,
        description: site.description,
        publisher: {
          "@id": organizationId,
        },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
