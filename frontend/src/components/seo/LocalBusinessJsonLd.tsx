import { site } from "@/constants/site";
import { getSiteContact } from "@/lib/data/siteContact";
import { env } from "@/lib/env";

export async function LocalBusinessJsonLd() {
  try {
    const contact = await getSiteContact();
    const address = contact.addressLines.filter(
      (line) => line.trim().length > 0,
    );
    const payload = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: site.name,
      alternateName: site.tagline,
      url: env.siteUrl,
      description: site.description,
      email: contact.email,
      telephone: contact.phoneHref.replace(/^tel:/i, "") || contact.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: address.join(" "),
        addressLocality: "Lahore",
        addressRegion: "Punjab",
        addressCountry: "PK",
      },
      areaServed: {
        "@type": "Country",
        name: "Pakistan",
      },
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
      />
    );
  } catch {
    return null;
  }
}
