"use client"
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { RiMenuFoldFill, RiCloseFill, RiSearchLine, RiUserLine, RiHeartLine } from "react-icons/ri";
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

export default function MainHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: "Hôtels", href: "/hotels", icon: "🏨" },
    { label: "Restaurants", href: "/restaurants", icon: "🍽️" },
    { label: "Lounges", href: "/lounges", icon: "🍸" },
    { label: "Résidences", href: "/residences", icon: "🏠" },
    { label: "Night Club", href: "/night-club", icon: "🎵" },
    { label: "Circuits", href: "/circuit-touristiques", icon: "🗺️" },
    { label: "Enfants", href: "/espace-jeux-enfant", icon: "🎠" },
    { label: "Événements", href: "/espace-evenementiels", icon: "🎉" },
  ];

  return (
    <section className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100' 
        : 'bg-white shadow-lg'
    }`}>
      <header className="container mx-auto flex flex-wrap md:flex-nowrap flex-row justify-between items-center py-3 px-2 md:px-0">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="group">
            <Image 
              src="/logo/logo-custom.png" 
              alt="Dolci Rêva Logo" 
              width={120} 
              height={60} 
              className="w-24 md:w-32 h-auto transition-transform duration-200 group-hover:scale-105" 
            />
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un lieu, un hôtel, un restaurant..."
              className="pl-10 pr-4 py-2 w-full rounded-full border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all duration-200"
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
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-theme-primary hover:bg-theme-primary/10"
          >
            <RiHeartLine className="w-5 h-5 mr-2" />
            Favoris
          </Button>
          <Link href="/auth/sign-in">
            <Button 
              variant="outline" 
              size="sm"
              className="border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white transition-all duration-200"
            >
              <RiUserLine className="w-4 h-4 mr-2" />
              Se connecter
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden flex-row gap-2 items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-gray-600 hover:text-theme-primary"
          >
            <RiSearchLine className="w-5 h-5" />
          </Button>
          <Link href="/auth/sign-in">
            <Button 
              variant="outline" 
              size="sm"
              className="border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white text-xs px-3"
            >
              Connexion
            </Button>
          </Link>
          {/* Burger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-theme-primary">
                <RiMenuFoldFill className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/logo/logo-custom.png" alt="Logo" width={40} height={20} />
                  Dolci Rêva
                </SheetTitle>
                <SheetDescription>
                  Découvrez les meilleurs lieux de Côte d'Ivoire
                </SheetDescription>
              </SheetHeader>
              
              {/* Mobile Search */}
              <div className="mt-6">
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 w-full rounded-full"
                  />
                </div>
              </div>

              {/* Mobile Menu */}
              <ul className="flex flex-col gap-2 mt-6">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                          ? "bg-theme-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
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
                  <Button variant="outline" className="w-full justify-start">
                    <RiHeartLine className="w-4 h-4 mr-2" />
                    Mes favoris
                  </Button>
                  <Link href="/auth/sign-in" className="w-full">
                    <Button className="w-full bg-theme-primary hover:bg-theme-primary/90">
                      <RiUserLine className="w-4 h-4 mr-2" />
                      Se connecter
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un lieu, un hôtel, un restaurant..."
              className="pl-10 pr-4 py-2 w-full rounded-full border-gray-200 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <RiCloseFill className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
} 