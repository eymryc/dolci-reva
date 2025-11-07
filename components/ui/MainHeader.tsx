"use client"
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RiMenuFoldFill, RiUserLine, RiLogoutBoxLine } from "react-icons/ri";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";

export default function MainHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isCustomer, isAnyAdmin, isOwner } = usePermissions();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie !");
    router.push("/");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  const getUserFullName = () => {
    if (!user) return "Utilisateur";
    return `${user.first_name} ${user.last_name}`;
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems: Array<{ label: string; href: string; icon: string }> = [
    // { label: "Résidences", href: "/residences", icon: "🏠" },
    // { label: "Hôtels", href: "/hotels", icon: "🏨" },
    // { label: "Restaurants", href: "/restaurants", icon: "🍽️" },
    // { label: "Lounges", href: "/lounges", icon: "🍸" },
    // { label: "Night Clubs", href: "/nightclubs", icon: "🎵" },
    // { label: "Circuits", href: "/circuits-touristiques", icon: "🗺️" },
    // { label: "Enfants", href: "/espaces-enfants", icon: "🎠" },
    // { label: "Événements", href: "/evenements", icon: "🎉" },
  ];

  return (
    <section className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
      isScrolled 
        ? 'bg-gradient-to-r from-theme-primary/95 to-theme-accent/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(240,132,0,0.2)] border-b border-theme-primary/30' 
        : 'bg-gradient-to-r from-theme-primary to-theme-accent backdrop-blur-md shadow-[0_4px_20px_rgb(240,132,0,0.15)] border-b border-theme-primary/20'
    }`}>
      <header className="container mx-auto flex flex-wrap md:flex-nowrap flex-row justify-between items-center py-3 md:py-4 px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex-shrink-0 relative">
          <Link href="/" className="group flex items-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/20 to-theme-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            <Image 
              src="/logo/logo-custom.png" 
              alt="Dolci Rêva Logo" 
              width={120} 
              height={60} 
              className="w-28 md:w-36 h-auto transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl relative z-10" 
            />
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden lg:flex items-center justify-center">
          <ul className="flex flex-row items-center justify-center gap-1.5">
            {menuItems.slice(0, 6).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group overflow-hidden ${
                    (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                      ? "bg-white text-theme-primary shadow-lg shadow-white/30 scale-105"
                      : "text-white/90 hover:text-white hover:bg-white/20"
                  }`}
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 text-lg transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                  <span className="relative z-10 hidden xl:inline transition-transform duration-300 group-hover:translate-x-0.5">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions - Desktop */}
        <div className="hidden lg:flex flex-row gap-3 items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group relative flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/20 transition-all duration-300 border border-white/30 shadow-lg shadow-white/10 hover:bg-white/30 hover:shadow-xl hover:shadow-white/20"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-100 transition-opacity duration-500" />
                  <Avatar className="relative z-10 w-9 h-9 ring-2 ring-white/50 transition-all duration-300 group-hover:scale-110">
                    <AvatarFallback className="bg-white text-theme-primary text-xs font-bold shadow-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="relative z-10 hidden xl:inline text-sm font-semibold text-white transition-colors duration-300">
                    {getUserFullName()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] border-2 border-gray-200/60 rounded-2xl bg-white/98 backdrop-blur-xl overflow-hidden transform transition-all duration-300 hover:shadow-[0_25px_70px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.08)]">
                <DropdownMenuLabel className="px-6 py-5 bg-gradient-to-br from-theme-primary/15 via-theme-primary/8 to-theme-accent/15 border-b-2 border-gray-200/60 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/30 to-theme-accent/30 rounded-full blur-md" />
                      <Avatar className="relative w-14 h-14 ring-4 ring-theme-primary/20 shadow-[0_8px_16px_rgba(240,132,0,0.3)]">
                        <AvatarFallback className="bg-gradient-to-br from-theme-primary via-theme-primary/90 to-theme-accent text-white font-bold text-base shadow-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-bold leading-tight text-gray-900 drop-shadow-sm">{getUserFullName()}</p>
                      <p className="text-xs leading-tight text-gray-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-300/50 to-transparent h-[1px]" />
                <DropdownMenuItem asChild className="px-6 py-3.5 cursor-pointer hover:bg-gradient-to-r hover:from-theme-primary/10 hover:to-theme-accent/10 transition-all duration-300 group relative overflow-hidden border-l-4 border-transparent hover:border-theme-primary">
                  <Link href={getAccountLink()} className="flex items-center w-full relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/5 to-theme-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-theme-primary/10 group-hover:bg-theme-primary/20 transition-colors duration-300 mr-3 shadow-sm">
                      <RiUserLine className="w-4 h-4 text-theme-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-semibold text-gray-800 group-hover:text-theme-primary transition-colors duration-300">
                      {isCustomer() ? "Mon espace client" : "Mon compte"}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-300/50 to-transparent h-[1px]" />
                <DropdownMenuItem onClick={handleLogout} className="px-6 py-3.5 cursor-pointer text-red-600 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-red-100/80 hover:text-red-700 transition-all duration-300 group relative overflow-hidden border-l-4 border-transparent hover:border-red-400">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors duration-300 mr-3 shadow-sm">
                    <RiLogoutBoxLine className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="relative z-10 font-semibold">Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/sign-in">
              <Button 
                variant="outline" 
                size="sm"
                className="group relative border-2 border-white/50 text-white hover:text-theme-primary transition-all duration-300 shadow-md hover:shadow-xl px-5 py-2.5 rounded-full font-semibold overflow-hidden bg-white/10 hover:bg-white"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center">
                  <RiUserLine className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Se connecter
                </span>
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden flex-row gap-2 items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group relative p-2 rounded-full bg-white/20 transition-all duration-300 border border-white/30 shadow-lg shadow-white/10 hover:bg-white/30 hover:shadow-xl hover:shadow-white/20"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-100 transition-opacity duration-300" />
                  <Avatar className="relative z-10 w-9 h-9 ring-2 ring-white/50 group-hover:scale-110 transition-all duration-300">
                    <AvatarFallback className="bg-white text-theme-primary text-xs font-bold shadow-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] border-2 border-gray-200/60 rounded-2xl bg-white/98 backdrop-blur-xl overflow-hidden transform transition-all duration-300 hover:shadow-[0_25px_70px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.08)]">
                <DropdownMenuLabel className="px-6 py-5 bg-gradient-to-br from-theme-primary/15 via-theme-primary/8 to-theme-accent/15 border-b-2 border-gray-200/60 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/30 to-theme-accent/30 rounded-full blur-md" />
                      <Avatar className="relative w-14 h-14 ring-4 ring-theme-primary/20 shadow-[0_8px_16px_rgba(240,132,0,0.3)]">
                        <AvatarFallback className="bg-gradient-to-br from-theme-primary via-theme-primary/90 to-theme-accent text-white font-bold text-base shadow-lg">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-bold leading-tight text-gray-900 drop-shadow-sm">{getUserFullName()}</p>
                      <p className="text-xs leading-tight text-gray-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-300/50 to-transparent h-[1px]" />
                <DropdownMenuItem asChild className="px-6 py-3.5 cursor-pointer hover:bg-gradient-to-r hover:from-theme-primary/10 hover:to-theme-accent/10 transition-all duration-300 group relative overflow-hidden border-l-4 border-transparent hover:border-theme-primary">
                  <Link href={getAccountLink()} className="flex items-center w-full relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/5 to-theme-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-theme-primary/10 group-hover:bg-theme-primary/20 transition-colors duration-300 mr-3 shadow-sm">
                      <RiUserLine className="w-4 h-4 text-theme-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-semibold text-gray-800 group-hover:text-theme-primary transition-colors duration-300">
                      {isCustomer() ? "Mon espace client" : "Mon compte"}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-300/50 to-transparent h-[1px]" />
                <DropdownMenuItem onClick={handleLogout} className="px-6 py-3.5 cursor-pointer text-red-600 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-red-100/80 hover:text-red-700 transition-all duration-300 group relative overflow-hidden border-l-4 border-transparent hover:border-red-400">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors duration-300 mr-3 shadow-sm">
                    <RiLogoutBoxLine className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="relative z-10 font-semibold">Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/sign-in">
              <Button 
                variant="outline" 
                size="sm"
                className="group relative border-2 border-white/50 text-white hover:text-theme-primary text-xs px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden bg-white/10 hover:bg-white"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Connexion</span>
              </Button>
            </Link>
          )}
          {/* Burger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="group relative text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2.5 transition-all duration-300">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <RiMenuFoldFill className="relative z-10 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[85vw] max-w-sm bg-gradient-to-br from-white via-gray-50/50 to-white backdrop-blur-xl border-l border-gray-200/50 p-0 overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className="px-4 pt-6 pb-4 border-b border-gray-200/50 sticky top-0 bg-gradient-to-br from-white via-gray-50/50 to-white backdrop-blur-sm z-10">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/30 to-theme-accent/30 rounded-xl blur-lg" />
                      <Image src="/logo/logo-custom.png" alt="Logo" width={40} height={20} className="relative rounded-lg" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_ease-in-out_infinite]">
                      Dolci Rêva
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-gray-600 mt-1.5 text-xs">
                    Découvrez les meilleurs lieux de Côte d&apos;Ivoire
                  </SheetDescription>
                </SheetHeader>

                {/* Mobile Menu */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <ul className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                            (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                              ? "bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-lg shadow-theme-primary/30"
                              : "text-gray-700 hover:bg-gradient-to-r hover:from-theme-primary/10 hover:to-theme-accent/10 hover:text-theme-primary"
                          }`}
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-theme-primary/20 to-theme-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative z-10 text-lg transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                          <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mobile Actions */}
                <div className="px-4 pt-4 pb-6 border-t border-gray-200/50 bg-gradient-to-br from-white via-gray-50/50 to-white backdrop-blur-sm sticky bottom-0">
                  <div className="flex flex-col gap-2.5">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-br from-theme-primary/10 via-theme-primary/5 to-theme-accent/10 border border-theme-primary/20 shadow-sm">
                          <Avatar className="w-10 h-10 ring-2 ring-theme-primary/30 shadow-md flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-accent text-white font-bold text-xs">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{getUserFullName()}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <Link href={getAccountLink()}>
                          <Button variant="outline" className="group w-full justify-start rounded-xl hover:bg-gradient-to-r hover:from-theme-primary/5 hover:to-theme-accent/5 hover:border-theme-primary/40 transition-all duration-300 hover:shadow-md text-sm py-2.5">
                            <RiUserLine className="w-4 h-4 mr-2 text-theme-primary group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                            <span className="font-medium group-hover:text-theme-primary transition-colors">
                              {isCustomer() ? "Mon espace client" : "Mon compte"}
                            </span>
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="group w-full justify-start rounded-xl text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:border-red-300 transition-all duration-300 hover:shadow-md text-sm py-2.5"
                          onClick={handleLogout}
                        >
                          <RiLogoutBoxLine className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
                          <span className="font-medium">Se déconnecter</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/sign-in" className="w-full">
                          <Button className="group relative w-full bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold overflow-hidden text-sm py-2.5">
                            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center justify-center">
                              <RiUserLine className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                            Se connecter
                            </span>
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </section>
  );
} 