import Image from "next/image";
import Link from "next/link";
import { FooterToneSync } from "@/components/layout/FooterToneSync";
import { navLinks, site } from "@/constants/site";
import { getSiteContact } from "@/lib/data/siteContact";

const SECTION_BG = "#5c6849";

const footerLinks = [
  { name: "Home", href: "/" },
  ...navLinks,
] as const;

type FooterSocialNetwork = "linkedin" | "instagram" | "facebook" | "x";

type FooterSocial = {
  readonly network: FooterSocialNetwork;
  readonly label: string;
  readonly href: string;
};

function SocialIcon({ network }: { readonly network: FooterSocialNetwork }) {
  if (network === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6.94 8.5H4.1V19.5h2.84V8.5ZM5.52 4.5A1.65 1.65 0 1 0 5.52 7.8 1.65 1.65 0 0 0 5.52 4.5ZM20.1 19.5h-2.83v-5.58c0-1.33-.48-2.24-1.68-2.24-.92 0-1.46.62-1.7 1.21-.09.22-.11.52-.11.83V19.5h-2.84s.04-9.55 0-10.54h2.84v1.49c.38-.58 1.05-1.41 2.56-1.41 1.87 0 3.27 1.22 3.27 3.85V19.5Z"
        />
      </svg>
    );
  }

  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 8.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2Zm0 6.25A2.45 2.45 0 1 1 12 9.55a2.45 2.45 0 0 1 0 4.9Zm4.94-6.52a.89.89 0 1 1-1.78 0 .89.89 0 0 1 1.78 0ZM12 3.5c-2.45 0-2.76.01-3.72.05-2.4.11-3.52 1.24-3.63 3.63-.04.96-.05 1.27-.05 3.72s.01 2.76.05 3.72c.11 2.39 1.23 3.52 3.63 3.63.96.04 1.27.05 3.72.05s2.76-.01 3.72-.05c2.4-.11 3.52-1.24 3.63-3.63.04-.96.05-1.27.05-3.72s-.01-2.76-.05-3.72c-.11-2.39-1.23-3.52-3.63-3.63C14.76 3.51 14.45 3.5 12 3.5Zm0 1.35c2.4 0 2.69.01 3.63.05 1.8.08 2.64.93 2.72 2.72.04.94.05 1.23.05 3.63s-.01 2.69-.05 3.63c-.08 1.79-.92 2.64-2.72 2.72-.94.04-1.23.05-3.63.05s-2.69-.01-3.63-.05c-1.8-.08-2.64-.93-2.72-2.72-.04-.94-.05-1.23-.05-3.63s.01-2.69.05-3.63c.08-1.79.92-2.64 2.72-2.72.94-.04 1.23-.05 3.63-.05Z"
        />
      </svg>
    );
  }

  if (network === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.5 8.5V6.8c0-.7.1-1.1 1.1-1.1h1.4V3.5h-2.2c-2.5 0-4.1 1.5-4.1 4.3v.7H9v2.4h1.7V20.5h2.9v-9.6h2.1l.3-2.4h-2.5Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.24 3.5h2.84l-6.21 7.1L22.1 20.5h-5.55l-4.34-5.68L7.1 20.5H4.25l6.64-7.59L2.1 3.5h5.69l3.92 5.2L18.24 3.5Zm-1 15.3h1.57L7.05 5.1H5.36l11.88 13.7Z"
      />
    </svg>
  );
}

export async function SiteFooter() {
  const year = new Date().getFullYear();
  let contact: Awaited<ReturnType<typeof getSiteContact>> | null = null;
  try {
    contact = await getSiteContact();
  } catch {
    contact = null;
  }

  const socials: readonly FooterSocial[] = contact
    ? (
        [
          {
            network: "linkedin" as const,
            label: "LinkedIn",
            href: contact.socialLinkedinUrl,
          },
          {
            network: "instagram" as const,
            label: "Instagram",
            href: contact.socialInstagramUrl,
          },
          {
            network: "facebook" as const,
            label: "Facebook",
            href: contact.socialFacebookUrl,
          },
          {
            network: "x" as const,
            label: "X",
            href: contact.socialXUrl,
          },
        ] as const
      ).filter((item) => item.href.length > 0)
    : [];

  return (
    <footer
      id="site-footer"
      aria-label="Site footer"
      data-header-tone="dark"
      data-header-bg={SECTION_BG}
      className="relative overflow-hidden bg-brand text-cream"
    >
      <FooterToneSync />
      <div className="relative mx-auto w-full max-w-[1360px] px-5 pt-16 pb-10 md:px-8 md:pt-20 md:pb-12 lg:px-10">
        <div className="grid gap-12 md:grid-cols-3 md:items-start md:gap-10">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
            >
              <Image
                src="/images/jumpIfZeroLogo.png"
                alt={`${site.name} logo`}
                width={40}
                height={38}
                className="h-8 w-auto md:h-9 md:w-auto"
              />
              <span className="leading-tight">
                <span className="block text-[0.95rem] font-bold tracking-[-0.02em]">
                  {site.name}
                </span>
                <span className="mt-0.5 block text-[0.72rem] font-medium tracking-[0.18em] text-cream/70 uppercase">
                  {site.tagline}
                </span>
              </span>
            </Link>
            <p className="max-w-xs text-[0.88rem] leading-[1.55] font-medium text-cream/70">
              {site.description}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-col gap-3 md:items-center"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[0.92rem] font-medium tracking-[-0.01em] text-cream transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="space-y-5 md:justify-self-end md:text-right">
            {contact ? (
              <div className="space-y-2 text-[0.88rem] font-medium text-cream/80">
                {contact.phone.trim().length > 0 ? (
                  <p>
                    <a
                      href={contact.phoneHref}
                      className="transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
                    >
                      {contact.phone}
                    </a>
                  </p>
                ) : null}
                {contact.email.trim().length > 0 ? (
                  <p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
                    >
                      {contact.email}
                    </a>
                  </p>
                ) : null}
                {contact.addressLines.length > 0 ? (
                  <address className="not-italic leading-[1.5]">
                    {contact.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                ) : null}
              </div>
            ) : null}

            {socials.length > 0 ? (
              <div className="flex flex-wrap gap-2 md:justify-end">
                {socials.map((social) => (
                  <a
                    key={social.network}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${site.name} on ${social.label}`}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/60 hover:bg-cream/10 focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:outline-none"
                  >
                    <SocialIcon network={social.network} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6">
          <p className="text-center text-[0.68rem] font-medium tracking-[0.08em] text-cream/75">
            © {year} All rights reserved by {site.name}.
          </p>
        </div>
      </div>
    </footer>
  );
}
