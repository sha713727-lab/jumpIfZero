import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { getSiteContact } from "@/lib/data/siteContact";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Start a scoped engagement with JZ Enterprises — tell us what you are building and we reply with a clear next step.",
  path: "/contact",
});

export default async function ContactPage() {
  const details = await getSiteContact();
  return <ContactPageClient details={details} />;
}
