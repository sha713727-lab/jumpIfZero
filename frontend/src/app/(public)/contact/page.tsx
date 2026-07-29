import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a scoped engagement with JZ Enterprises — tell us what you are building and we reply with a clear next step.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
