"use client"
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RiMenuFoldFill, RiCloseFill, RiSearchLine, RiUserLine, RiHeartLine, RiLogoutBoxLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

export default function MainHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems: Array<{ label: string; href: string; icon: string }> = [
    // { label: "Hôtels", href: "/hotels", icon: "🏨" },
    // { label: "Restaurants", href: "/restaurants", icon: "🍽️" },
    // { label: "Lounges", href: "/lounges", icon: "🍸" },
    // { label: "Résidences", href: "/residences", icon: "🏠" },
    // { label: "Night Clubs", href: "/nightclubs", icon: "🎵" },
    // { label: "Circuits", href: "/circuits-touristiques", icon: "🗺️" },
    // { label: "Enfants", href: "/espaces-enfants", icon: "🎠" },
    // { label: "Événements", href: "/evenements", icon: "🎉" },
  ];

  return (
    <section className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100'
    }`}>
      <header className="container mx-auto flex flex-wrap md:flex-nowrap flex-row justify-between items-center py-4 px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="group flex items-center">
            <Image 
              src="/logo/logo-custom.png" 
              alt="Dolci Rêva Logo" 
              width={120} 
              height={60} 
              className="w-28 md:w-36 h-auto transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg" 
            />
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-theme-primary transition-colors duration-200" />
            <Input
              type="text"
              placeholder="Rechercher un lieu, un hôtel, un restaurant..."
              className="pl-11 pr-4 py-2.5 w-full rounded-full border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all duration-200 shadow-sm hover:shadow-md hover:border-gray-300"
            />
          </div>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden lg:flex items-center justify-center">
          <ul className="flex flex-row items-center justify-center gap-1">
            {menuItems.slice(0, 6).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                      ? "bg-theme-primary text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-theme-primary"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden xl:inline">{item.label}</span>
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
                  className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-gradient-to-r hover:from-theme-primary/5 hover:to-theme-accent/5 transition-all duration-200 border border-transparent hover:border-theme-primary/20"
                >
                  <Avatar className="w-9 h-9 ring-2 ring-theme-primary/20 hover:ring-theme-primary/40 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-accent text-white text-xs font-bold shadow-md">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden xl:inline text-sm font-semibold text-gray-700">
                    {getUserFullName()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 shadow-xl border border-gray-200 rounded-xl">
                <DropdownMenuLabel className="px-4 py-3 bg-gradient-to-br from-theme-primary/5 to-theme-accent/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-theme-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-accent text-white font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-bold leading-none text-gray-900">{getUserFullName()}</p>
                      <p className="text-xs leading-none text-gray-500 mt-1">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer hover:bg-theme-primary/5">
                  <Link href="/admin/dashboard" className="flex items-center">
                    <RiUserLine className="w-4 h-4 mr-3 text-theme-primary" />
                    <span className="font-medium">Mon compte</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer hover:bg-theme-primary/5">
                  <Link href="/favoris" className="flex items-center">
                    <RiHeartLine className="w-4 h-4 mr-3 text-red-500" />
                    <span className="font-medium">Mes favoris</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="px-4 py-2.5 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700">
                  <RiLogoutBoxLine className="w-4 h-4 mr-3" />
                  <span className="font-medium">Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/sign-in">
              <Button 
                variant="outline" 
                size="sm"
                className="border-2 border-theme-primary text-theme-primary hover:bg-gradient-to-r hover:from-theme-primary hover:to-theme-accent hover:text-white transition-all duration-300 shadow-sm hover:shadow-md px-4 py-2 rounded-full font-semibold"
              >
                <RiUserLine className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden flex-row gap-2 items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-gray-600 hover:text-theme-primary hover:bg-theme-primary/10 rounded-full p-2 transition-all duration-200"
          >
            <RiSearchLine className="w-5 h-5" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 rounded-full hover:bg-theme-primary/10 transition-all duration-200"
                >
                  <Avatar className="w-9 h-9 ring-2 ring-theme-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-accent text-white text-xs font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 shadow-xl border border-gray-200 rounded-xl">
                <DropdownMenuLabel className="px-4 py-3 bg-gradient-to-br from-theme-primary/5 to-theme-accent/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-theme-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-accent text-white font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-bold leading-none text-gray-900">{getUserFullName()}</p>
                      <p className="text-xs leading-none text-gray-500 mt-1">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer hover:bg-theme-primary/5">
                  <Link href="/admin/dashboard" className="flex items-center">
                    <RiUserLine className="w-4 h-4 mr-3 text-theme-primary" />
                    <span className="font-medium">Mon compte</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer hover:bg-theme-primary/5">
                  <Link href="/favoris" className="flex items-center">
                    <RiHeartLine className="w-4 h-4 mr-3 text-red-500" />
                    <span className="font-medium">Mes favoris</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="px-4 py-2.5 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700">
                  <RiLogoutBoxLine className="w-4 h-4 mr-3" />
                  <span className="font-medium">Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/sign-in">
              <Button 
                variant="outline" 
                size="sm"
                className="border-2 border-theme-primary text-theme-primary hover:bg-gradient-to-r hover:from-theme-primary hover:to-theme-accent hover:text-white text-xs px-3 py-2 rounded-full font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Connexion
              </Button>
            </Link>
          )}
          {/* Burger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-theme-primary hover:bg-theme-primary/10 rounded-full p-2 transition-all duration-200">
                <RiMenuFoldFill className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 bg-gradient-to-b from-white to-gray-50">
              <SheetHeader className="pb-4 border-b border-gray-200">
                <SheetTitle className="flex items-center gap-3">
                  <Image src="/logo/logo-custom.png" alt="Logo" width={50} height={25} className="rounded-lg" />
                  <span className="text-xl font-bold bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
                    Dolci Rêva
                  </span>
                </SheetTitle>
                <SheetDescription className="text-gray-600 mt-2">
                  Découvrez les meilleurs lieux de Côte d&apos;Ivoire
                </SheetDescription>
              </SheetHeader>
              
              {/* Mobile Search */}
              <div className="mt-6">
                <div className="relative group">
                  <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-theme-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-11 pr-4 py-2.5 w-full rounded-full border-2 border-gray-200 bg-white focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 shadow-sm"
                  />
                </div>
              </div>

              {/* Mobile Menu */}
              <ul className="flex flex-col gap-2 mt-6">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                          ? "bg-gradient-to-r from-theme-primary to-theme-accent text-white shadow-md"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-theme-primary/5 hover:to-theme-accent/5 hover:text-theme-primary"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Mobile Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col gap-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-theme-primary/10 to-theme-accent/10 border border-theme-primary/20">
                        <Avatar className="w-12 h-12 ring-2 ring-theme-primary/30">
                          <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-accent text-white font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{getUserFullName()}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/admin/dashboard">
                        <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-theme-primary/5 hover:border-theme-primary/30 transition-all">
                          <RiUserLine className="w-4 h-4 mr-2 text-theme-primary" />
                          <span className="font-medium">Mon compte</span>
                        </Button>
                      </Link>
                      <Link href="/favoris">
                        <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-red-50 hover:border-red-200 transition-all">
                          <RiHeartLine className="w-4 h-4 mr-2 text-red-500" />
                          <span className="font-medium">Mes favoris</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all"
                        onClick={handleLogout}
                      >
                        <RiLogoutBoxLine className="w-4 h-4 mr-2" />
                        <span className="font-medium">Se déconnecter</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/favoris">
                        <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-gray-50 transition-all">
                          <RiHeartLine className="w-4 h-4 mr-2 text-red-500" />
                          <span className="font-medium">Mes favoris</span>
                        </Button>
                      </Link>
                      <Link href="/auth/sign-in" className="w-full">
                        <Button className="w-full bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold">
                          <RiUserLine className="w-4 h-4 mr-2" />
                          Se connecter
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-4 shadow-inner">
          <div className="relative group">
            <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-theme-primary transition-colors" />
            <Input
              type="text"
              placeholder="Rechercher un lieu, un hôtel, un restaurant..."
              className="pl-11 pr-12 py-2.5 w-full rounded-full border-2 border-gray-200 bg-white focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 shadow-sm"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full hover:bg-gray-100 p-2"
            >
              <RiCloseFill className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
} 