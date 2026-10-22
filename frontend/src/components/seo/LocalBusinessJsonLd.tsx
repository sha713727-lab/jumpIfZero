import { site } from "@/constants/site";
import { getSiteContact } from "@/lib/data/siteContact";
import { env } from "@/lib/env";
import { formatStreetAddress, formatTelephone } from "@/lib/seo/nap";

export async function LocalBusinessJsonLd() {
  const contact = await getSiteContact();
  const streetAddress = formatStreetAddress(contact.addressLines);
  const telephone = formatTelephone(contact.phoneHref, contact.phone);

  const payload = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    alternateName: site.tagline,
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
    areaServed: [
      {
        "@type": "City",
        name: "Lahore",
      },
      {
        "@type": "Country",
        name: "Pakistan",
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
