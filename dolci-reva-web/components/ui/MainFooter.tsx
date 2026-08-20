import Image from "next/image";
import Link from "next/link";

export default function MainFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { label: "Résidences", href: "/residences" },
      { label: "Hôtels", href: "/hotels" },
      { label: "Restaurants", href: "/restaurants" },
      { label: "Bars & Lounges", href: "/bars" },
      { label: "Night-Clubs", href: "/night-clubs" },
      { label: "Se loger", href: "/se-loger" },
    ],
    company: [
      { label: "Notre équipe", href: "/team" },
      { label: "Carrières", href: "/careers" },
      { label: "Presse", href: "/press" },
    ],
    support: [
      { label: "Centre d'aide", href: "/help" },
      { label: "Nous contacter", href: "mailto:contact@dolcireva.com" },
      { label: "FAQ", href: "/faq" },
      { label: "Support technique", href: "/support" },
    ],
    legal: [
      { label: "Conditions", href: "/terms" },
      { label: "Confidentialité", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Mentions légales", href: "/legal" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      href: "#",
      icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
      name: "Instagram",
      href: "#",
      icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.98-.49-.98-.98s.49-.98.98-.98.98.49.98.98-.49.98-.98.98zm-7.83 11.281c-2.26 0-4.1-1.84-4.1-4.1s1.84-4.1 4.1-4.1 4.1 1.84 4.1 4.1-1.84 4.1-4.1 4.1z",
    },
    {
      name: "Twitter",
      href: "#",
      icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.371 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#12100c] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f08400]/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#f08400]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#ffb347]/10 blur-3xl"
      />

      <section className="relative py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-6 lg:col-span-5">
              <div className="inline-block border border-white/10 bg-white px-3 py-2">
                <Image
                  src="/logo/logo-custom.png"
                  alt="Dolci Rêva"
                  width={160}
                  height={72}
                  className="h-12 w-auto"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ffb347]">
                  Kiffer l&apos;instant
                </p>
                <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-white/65 sm:text-base">
                  La Côte d&apos;Ivoire, sans filtre. Hôtels, tables, rooftops et
                  nuits — des adresses choisies pour des moments qui restent.
                </p>
              </div>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/70 transition-all duration-300 hover:border-[#f08400] hover:bg-[#f08400] hover:text-white"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb347]">
                Explorer
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.explore.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb347]">
                Entreprise
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb347]">
                Support
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
          <p className="text-xs text-white/45 sm:text-sm">
            © {currentYear} Dolci Rêva. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/45 transition-colors hover:text-[#ffb347] sm:text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </footer>
  );
}
