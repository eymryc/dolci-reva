"use client"
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { RiMenuFoldFill, RiUserLine, RiLogoutBoxLine, RiAddLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
   Sheet,
   SheetContent,
   SheetDescription,
   SheetHeader,
   SheetTitle,
   SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Home,
  LogOut,
  UserRound,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MainHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCustomer, isAnyAdmin, isOwner } = usePermissions();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fermer le menu mobile après navigation (Link client-side ne ferme pas le Sheet)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Vérifier le statut de vérification pour les propriétaires
  // Utiliser directement user.verification_status depuis le contexte d'authentification
  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  // Afficher l'alerte uniquement si :
  // 1. L'utilisateur est un owner
  // 2. Le statut existe et n'est pas "APPROVED"
  // 3. L'utilisateur n'est pas vérifié
  const isOwnerNotVerified = isOwner() && verificationStatus !== undefined && verificationStatus !== null && !isOwnerVerified;
  
  // Réinitialiser showVerificationAlert quand l'utilisateur devient vérifié
  useEffect(() => {
    if (isOwnerVerified) {
      setShowVerificationAlert(false);
    }
  }, [isOwnerVerified]);
  
  // Debug: afficher les valeurs pour déboguer
  useEffect(() => {
    // if (isOwner()) {
    //   console.log("Owner verification status debug:", {
    //     rawVerificationStatus: user?.verification_status,
    //     verificationStatus,
    //     isOwnerVerified,
    //     isOwnerNotVerified,
    //     userType: user?.type,
    //     showVerificationAlert,
    //     pathname,
    //     shouldShowAlert: isOwnerNotVerified && showVerificationAlert && pathname.startsWith("/admin"),
    //   });
    // }
  }, [verificationStatus, isOwnerVerified, isOwnerNotVerified, isOwner, user, showVerificationAlert, pathname]);

  const handleLogout = () => {
    toast.success("Déconnexion réussie !");
    logout("/");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  const getUserShortName = () => {
    if (!user) return "Utilisateur";
    const initial = user.first_name?.charAt(0)?.toUpperCase() || "";
    const lastName = user.last_name?.trim() || "";
    if (!initial && !lastName) return "Utilisateur";
    if (!initial) return lastName;
    if (!lastName) return `${initial}.`;
    return `${initial}. ${lastName}`;
  };

  // Déterminer le lien du compte selon le type d'utilisateur
  const getAccountLink = () => {
    if (isCustomer()) {
      return "/customer/dashboard";
    } else if (isAnyAdmin() || isOwner()) {
      return "/admin/dashboard";
    }
    return "/admin/dashboard"; // Par défaut
  };

  const accountLabel = isCustomer() ? "Mon espace client" : "Mon compte";

  const UserMenu = ({ compact = false }: { compact?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Ouvrir le menu compte"
          className={cn(
            "group flex items-center gap-2 border border-white/35 bg-white/15 text-white outline-none transition-all duration-300",
            "hover:border-white/70 hover:bg-white/25",
            "focus-visible:ring-2 focus-visible:ring-white/60",
            "data-[state=open]:border-white data-[state=open]:bg-white data-[state=open]:text-[#f08400]",
            compact ? "h-9 px-2" : "h-10 px-2.5"
          )}
        >
          <Avatar
            className={cn(
              "overflow-hidden rounded-none",
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
          >
            <AvatarFallback className="rounded-none bg-white text-[11px] font-bold text-[#f08400] group-data-[state=open]:bg-[#fff4e8]">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <span className="hidden max-w-[140px] truncate text-left text-xs font-semibold uppercase tracking-wide xl:inline xl:max-w-[160px]">
              {getUserShortName()}
            </span>
          )}
          <ChevronDown
            className={cn(
              "shrink-0 opacity-90 transition-transform duration-300 group-data-[state=open]:rotate-180",
              compact ? "h-3.5 w-3.5" : "h-4 w-4"
            )}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[280px] overflow-hidden rounded-none border border-[#12100c]/10 bg-white p-0 shadow-[0_24px_50px_-20px_rgba(18,16,12,0.45)]"
      >
        <DropdownMenuLabel className="p-0">
          <div className="border-b border-white/10 bg-[#12100c] px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 overflow-hidden rounded-none">
                <AvatarFallback className="rounded-none bg-[#f08400] text-sm font-bold text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {getUserShortName()}
                </p>
                <p className="truncate text-xs text-white/55">{user?.email}</p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="p-1.5">
          {isCustomer() ? (
            <>
              {(
                [
                  {
                    href: "/customer/dashboard",
                    label: "Accueil",
                    hint: "Prochain séjour & raccourcis",
                    icon: Home,
                  },
                  {
                    href: "/customer/bookings",
                    label: "Réservations",
                    hint: "Tous vos séjours",
                    icon: CalendarDays,
                  },
                  {
                    href: "/customer/profile",
                    label: "Profil",
                    hint: "Informations personnelles",
                    icon: UserRound,
                  },
                ] as const
              ).map(({ href, label, hint, icon: Icon }) => (
                <DropdownMenuItem
                  key={href}
                  asChild
                  className="cursor-pointer rounded-none px-3 py-3 focus:bg-[#fff4e8] focus:text-[#c96d00]"
                >
                  <Link href={href} className="flex w-full items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center border border-[#f08400]/25 bg-[#fff4e8] text-[#f08400]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-[#12100c]">
                        {label}
                      </span>
                      <span className="text-[11px] text-[#5c574f]">{hint}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </>
          ) : (
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-none px-3 py-3 focus:bg-[#fff4e8] focus:text-[#c96d00]"
            >
              <Link href={getAccountLink()} className="flex w-full items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-[#f08400]/25 bg-[#fff4e8] text-[#f08400]">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-[#12100c]">
                    {accountLabel}
                  </span>
                  <span className="text-[11px] text-[#5c574f]">
                    Tableau de bord & profil
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="my-1.5 bg-[#12100c]/08" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer rounded-none px-3 py-3 text-[#b42318] focus:bg-[#fef3f2] focus:text-[#912018]"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-[#fecdca] bg-[#fef3f2] text-[#b42318]">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">Se déconnecter</span>
              <span className="text-[11px] opacity-70">Fermer la session</span>
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const establishmentNavItems = [
    { label: "Résidences", href: "/residences" },
    { label: "Hôtels", href: "/hotels" },
    { label: "Restaurants", href: "/restaurants" },
    { label: "Bars", href: "/bars" },
    { label: "Lounges", href: "/lounges" },
    { label: "Night-Clubs", href: "/night-clubs" },
  ];

  const primaryNavItems = [
    ...establishmentNavItems,
    { label: "Se loger", href: "/se-loger" },
  ];

  const isNavActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const navLinkClass = (isActive: boolean) =>
    cn(
      "relative whitespace-nowrap rounded-none px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 xl:px-3 xl:py-2 xl:text-xs",
      isActive
        ? "bg-white text-theme-primary shadow-sm"
        : "text-white/90 hover:bg-white/10 hover:text-white"
    );

  const publishHref = user
    ? "/admin/residences/new"
    : "/auth/sign-up";

  return (
    <section
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-gradient-to-r from-theme-primary via-[#e87a00] to-theme-accent shadow-[0_4px_24px_rgba(240,132,0,0.35)]"
          : "bg-gradient-to-r from-theme-primary via-theme-primary to-theme-accent"
      )}
    >
      {/* Alerte de vérification pour les propriétaires non vérifiés (uniquement dans l'admin) */}
      {isOwnerNotVerified && showVerificationAlert && pathname.startsWith("/admin") && (
        <div className="relative bg-yellow-500 border-b border-yellow-600 shadow-lg">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-yellow-900 flex-shrink-0" />
                <p className="text-sm font-medium text-yellow-900">
                  <span className="font-bold">Votre compte n&apos;est pas encore vérifié.</span>{" "}
                  Vérifiez votre compte pour publier vos résidences et gagner la confiance des clients.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/admin/profile?tab=verification">
                  <Button
                    size="sm"
                    className="bg-yellow-900 hover:bg-yellow-950 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Vérifier mon compte
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerificationAlert(false)}
                  className="text-yellow-900 hover:bg-yellow-600/20 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <header className="container mx-auto px-4 py-2.5 md:px-6 lg:px-8 lg:py-3">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2 md:flex-nowrap">
        {/* Logo */}
        <div className="relative z-10 flex-shrink-0">
          <Link href="/" className="group flex items-center">
            <div className="rounded-lg bg-white p-2 shadow-md transition-all duration-300 group-hover:shadow-lg">
              <Image
                src="/logo/logo-custom.png"
                alt="Dolci Rêva Logo"
                width={120}
                height={60}
                className="h-auto w-24 transition-all duration-300 md:w-28"
              />
            </div>
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav className="mx-2 hidden min-w-0 flex-1 lg:block">
          <ul className="flex flex-row flex-wrap items-center justify-center gap-0.5">
            {primaryNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={navLinkClass(isNavActive(item.href))}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions - Desktop */}
        <div className="relative z-10 hidden flex-shrink-0 flex-row items-center gap-2.5 lg:flex">
          <Link href={publishHref}>
            <Button
              variant="outline"
              size="sm"
              className="h-10 border-white/60 bg-transparent px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/10 hover:text-white"
            >
              <RiAddLine className="mr-1.5 h-4 w-4" />
              <span className="hidden xl:inline">Publier mes services</span>
              <span className="xl:hidden">Publier</span>
            </Button>
          </Link>
          {user ? (
            <UserMenu />
          ) : (
            <Link href="/auth/sign-in">
              <Button
                size="sm"
                className="h-10 bg-white px-6 text-sm font-semibold text-theme-primary shadow-sm hover:bg-white/95"
              >
                <RiUserLine className="mr-1.5 h-4 w-4" />
                Se connecter
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="relative z-10 flex flex-row items-center gap-2 lg:hidden">
          {isMounted ? (
            <>
              <Link href={publishHref}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-white/60 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/10"
                >
                  <RiAddLine className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Publier</span>
                </Button>
              </Link>
              {user ? (
                <UserMenu compact />
              ) : (
                <Link href="/auth/sign-in">
                  <Button
                    size="sm"
                    className="h-9 bg-white px-3.5 text-xs font-semibold text-theme-primary hover:bg-white/95"
                  >
                    Connexion
                  </Button>
                </Link>
              )}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-lg border border-white/30 p-0 text-white hover:bg-white/15"
                  >
                    <RiMenuFoldFill className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[85vw] max-w-sm overflow-y-auto border-l border-orange-100 bg-white p-0">
                  <div className="flex h-full flex-col">
                    <SheetHeader className="sticky top-0 z-10 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white px-5 pb-4 pt-6">
                      <SheetTitle className="flex items-center gap-3">
                        <Image src="/logo/logo-custom.png" alt="Logo" width={40} height={20} />
                        <span className="text-lg font-bold text-theme-secondary">Dolci Rêva</span>
                      </SheetTitle>
                      <SheetDescription className="mt-1 text-xs text-gray-500">
                        Découvrez les meilleurs lieux de Côte d&apos;Ivoire
                      </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      <ul className="flex flex-col gap-0.5">
                        {primaryNavItems.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "block rounded-none px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                                isNavActive(item.href)
                                  ? "bg-orange-50 text-theme-primary"
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="sticky bottom-0 border-t border-orange-100 bg-white px-4 pb-6 pt-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={publishHref}
                          className="w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button className="h-11 w-full bg-theme-primary text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-theme-primary/90">
                            <RiAddLine className="mr-2 h-4 w-4" />
                            Publier mes services
                          </Button>
                        </Link>
                        {user ? (
                          <>
                            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarFallback className="bg-theme-primary text-xs font-bold text-white">
                                  {getUserInitials()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">{getUserShortName()}</p>
                                <p className="truncate text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <Link
                              href={getAccountLink()}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button variant="outline" className="h-11 w-full justify-start rounded-xl text-sm">
                                <RiUserLine className="mr-2 h-4 w-4 text-theme-primary" />
                                {isCustomer() ? "Mon espace client" : "Mon compte"}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              className="h-11 w-full justify-start rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                handleLogout();
                              }}
                            >
                              <RiLogoutBoxLine className="mr-2 h-4 w-4" />
                              Se déconnecter
                            </Button>
                          </>
                        ) : (
                          <Link
                            href="/auth/sign-in"
                            className="w-full"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button className="h-11 w-full bg-theme-primary text-sm font-semibold text-white hover:bg-theme-primary/90">
                              <RiUserLine className="mr-2 h-4 w-4" />
                              Se connecter
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex flex-row items-center gap-2">
              <div className="h-9 w-16 animate-pulse rounded-lg bg-white/20" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-white/20" />
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg border border-white/30 p-0" disabled>
                <RiMenuFoldFill className="h-5 w-5 text-white/50" />
              </Button>
            </div>
          )}
        </div>
        </div>
      </header>

      <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </section>
  );
}