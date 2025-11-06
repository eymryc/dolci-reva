import Image from "next/image";
import Link from "next/link";

export default function MainFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "À propos de nous", href: "/about" },
      { label: "Notre équipe", href: "/team" },
      { label: "Carrières", href: "/careers" },
      { label: "Presse", href: "/press" },
    ],
    support: [
      { label: "Centre d'aide", href: "/help" },
      { label: "Nous contacter", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Support technique", href: "/support" },
    ],
    legal: [
      { label: "Conditions d'utilisation", href: "/terms" },
      { label: "Politique de confidentialité", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Mentions légales", href: "/legal" },
    ],
  };

  const socialLinks = [
    { 
      name: "Facebook", 
      href: "#", 
      icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      color: "hover:bg-[#1877F2]"
    },
    { 
      name: "Instagram", 
      href: "#", 
      icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.98-.49-.98-.98s.49-.98.98-.98.98.49.98.98-.49.98-.98.98zm-7.83 11.281c-2.26 0-4.1-1.84-4.1-4.1s1.84-4.1 4.1-4.1 4.1 1.84 4.1 4.1-1.84 4.1-4.1 4.1z",
      color: "hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#FCAF45]"
    },
    { 
      name: "Twitter", 
      href: "#", 
      icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
      color: "hover:bg-[#1DA1F2]"
    },
    { 
      name: "LinkedIn", 
      href: "#", 
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.371 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
      color: "hover:bg-[#0077B5]"
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 border-t border-slate-200/60 overflow-hidden">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-theme-primary/10 via-theme-accent/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-theme-accent/10 via-theme-primary/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Main Footer Content */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 lg:gap-16">
            {/* Logo & Description */}
            <div className="md:col-span-2 lg:col-span-2 space-y-6 lg:space-y-7 animate-fade-in-up">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-theme-primary/30 via-theme-accent/20 to-theme-primary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-slate-200/50 group-hover:border-theme-primary/30 transition-all duration-300">
                  <Image 
                    src="/logo/logo-custom.png" 
                    alt="Dolci Rêva Logo" 
                    width={180} 
                    height={90} 
                    className="h-14 w-auto transition-all duration-300 group-hover:scale-105" 
                  />
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-base max-w-md font-light">
                Découvrez les trésors cachés de la Côte d&apos;Ivoire. Des hôtels d&apos;exception, 
                une gastronomie raffinée, des lieux magiques qui vous feront vivre des moments inoubliables.
              </p>
              <div className="flex gap-3 lg:gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className={`relative w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-theme-primary ${social.color} hover:text-white transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-110 hover:-translate-y-1 group border border-slate-200/50 hover:border-transparent`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap bg-white px-2 py-1 rounded-md shadow-lg border border-slate-200/50">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="relative mb-6 lg:mb-7">
                <h4 className="text-base lg:text-lg font-bold text-slate-900 relative inline-block">
                  Entreprise
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary rounded-full"></span>
                </h4>
              </div>
              <ul className="space-y-3 lg:space-y-3.5">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group relative text-slate-600 hover:text-theme-primary transition-all duration-300 flex items-center gap-3 py-1.5 px-2 -ml-2 rounded-lg hover:bg-white/60 hover:backdrop-blur-sm"
                    >
                      <span className="absolute left-0 w-1 h-0 bg-gradient-to-b from-theme-primary to-theme-accent rounded-full group-hover:h-full transition-all duration-300"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-theme-primary transition-all duration-300 group-hover:scale-125 opacity-0 group-hover:opacity-100"></span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300 font-medium">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="relative mb-6 lg:mb-7">
                <h4 className="text-base lg:text-lg font-bold text-slate-900 relative inline-block">
                  Support
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary rounded-full"></span>
                </h4>
              </div>
              <ul className="space-y-3 lg:space-y-3.5">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="group relative text-slate-600 hover:text-theme-primary transition-all duration-300 flex items-center gap-3 py-1.5 px-2 -ml-2 rounded-lg hover:bg-white/60 hover:backdrop-blur-sm"
                    >
                      <span className="absolute left-0 w-1 h-0 bg-gradient-to-b from-theme-primary to-theme-accent rounded-full group-hover:h-full transition-all duration-300"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-theme-primary transition-all duration-300 group-hover:scale-125 opacity-0 group-hover:opacity-100"></span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300 font-medium">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <section className="relative border-t border-slate-200/60 bg-gradient-to-r from-white/80 via-white/60 to-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
              <span className="text-theme-primary font-bold text-base">©</span>
              <span>{currentYear} Dolci Rêva. Tous droits réservés.</span>
            </p>
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm justify-center items-center">
              {footerLinks.legal.map((link, index) => (
                <div key={link.href} className="flex items-center gap-4">
                  <Link 
                    href={link.href} 
                    className="text-slate-500 hover:text-theme-primary transition-all duration-300 relative group font-medium"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-theme-primary to-theme-accent group-hover:w-full transition-all duration-300 rounded-full"></span>
                  </Link>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
} 