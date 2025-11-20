"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  MoreVertical,
  MessageSquare,
  Bell,
  Menu,
  LogOut,
  Home,
  AlertCircle,
  X,
  User,
  Wallet,
  Lock,
  QrCode,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QRCodeScannerModal } from "@/components/admin/QRCodeScannerModal";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission?: () => boolean;
}

const allNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Profil", icon: User, href: "/admin/profile", permission: () => true }, // Accessible à tous les utilisateurs connectés
  { name: "Résidences", icon: Home, href: "/admin/residences", permission: () => true }, // Accessible à tous les utilisateurs connectés
  { name: "Hebergements", icon: Home, href: "/admin/hebergements", permission: () => true }, // Accessible à tous les utilisateurs connectés
];

// Fonction pour obtenir les initiales du nom
const getInitials = (first_name: string | undefined, last_name: string | undefined): string => {
  if (!first_name && !last_name) return "U";
  const first = first_name?.trim().charAt(0).toUpperCase() || "";
  const last = last_name?.trim().charAt(0).toUpperCase() || "";
  if (first && last) {
    return first + last;
  }
  if (first) {
    return first + (first_name?.trim().charAt(1) || "").toUpperCase();
  }
  if (last) {
    return last + (last_name?.trim().charAt(1) || "").toUpperCase();
  }
  return "U";
};

// Fonction pour obtenir le nom complet
const getFullName = (first_name: string | undefined, last_name: string | undefined): string => {
  if (!first_name && !last_name) return "Utilisateur";
  const parts = [first_name, last_name].filter(Boolean);
  return parts.join(" ") || "Utilisateur";
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { canManageUsers, isAnyAdmin, isOwner } = usePermissions();
  // Initialiser à false sur mobile, true sur desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [isDesktop, setIsDesktop] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const isLoginPage = pathname === "/auth/sign-in";
  const [showVerificationAlert, setShowVerificationAlert] = useState(true);

  // Détecter si on est sur desktop
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktopSize = window.innerWidth >= 1024;
      setIsDesktop(isDesktopSize);
      // Sur desktop, forcer la sidebar à être ouverte
      // Sur mobile, fermer la sidebar si elle était ouverte
      if (isDesktopSize) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Vérifier le statut de vérification pour les propriétaires
  // Utiliser directement user.verification_status depuis le contexte d'authentification
  const verificationStatus = user?.verification_status?.trim().toUpperCase();
  const isOwnerVerified = verificationStatus === "APPROVED";
  const isOwnerNotVerified = isOwner() && verificationStatus !== undefined && verificationStatus !== null && !isOwnerVerified;
  
  // Réinitialiser showVerificationAlert quand l'utilisateur devient vérifié
  useEffect(() => {
    if (isOwnerVerified) {
      setShowVerificationAlert(false);
    }
  }, [isOwnerVerified]);

  // Filtrer les items de navigation selon les permissions
  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    return item.permission();
  });

  // Vérifier si l'utilisateur a accès à l'interface admin
  // Seuls les admins, super admins et propriétaires ont accès
  const hasAdminAccess = isAnyAdmin() || isOwner();

  // Fonction pour déconnecter l'utilisateur
  const handleLogout = () => {
    logout();
    // Utiliser setTimeout pour éviter l'erreur de mise à jour pendant le rendu
    setTimeout(() => {
      router.push("/auth/sign-in");
    }, 0);
  };

  // Rediriger vers la page de login si pas d'utilisateur ou si l'utilisateur n'a pas accès (après le chargement)
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push("/auth/sign-in");
    } else if (!loading && user && !isLoginPage && !hasAdminAccess) {
      // Si l'utilisateur est un client, rediriger vers la page d'accueil
      router.push("/");
    }
  }, [loading, user, isLoginPage, router, hasAdminAccess]);

  // Si c'est la page de login, ne pas afficher le layout avec sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Afficher un loader pendant le chargement des données utilisateur
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#f08400] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, afficher un loader pendant la redirection
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#f08400] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  const userInitials = getInitials(user.first_name, user.last_name);
  const userFullName = getFullName(user.first_name, user.last_name);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen 
            ? "translate-x-0" 
            : "-translate-x-full lg:translate-x-0"
        } ${
          // Sur desktop, toujours largeur 72. Sur mobile, dépend de isSidebarOpen
          isSidebarOpen ? "w-72" : "w-72 lg:w-72"
        } fixed lg:relative z-50 lg:z-10 transition-all duration-300 flex flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl h-full`}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[#f08400]/5 pointer-events-none"></div>
        
        {/* Logo */}
        <div className="relative z-10 h-16 sm:h-20 flex items-center px-3 sm:px-6 border-b border-gray-200/50">
          {/* Trait de division avec accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f08400]/60 to-transparent shadow-[0_2px_8px_rgba(240,132,0,0.3)]"></div>
          <Link href="/admin/dashboard" className="group flex items-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#f08400]/10 to-[#f08400]/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            <Image 
              src="/logo/logo-custom.png" 
              alt="Dolci Rêva Logo" 
              width={120} 
              height={60} 
              className="h-8 sm:h-10 lg:h-12 w-auto transition-all duration-300 group-hover:scale-105 relative z-10"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 px-2 sm:px-4 py-3 sm:py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Fermer le sidebar sur mobile quand on clique sur un lien
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`group relative flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${isActive
                    ? "bg-[#f08400] text-white shadow-lg shadow-[#f08400]/25 scale-[1.02]"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {(isSidebarOpen || isDesktop) && (
                  <span className={`text-xs sm:text-sm font-medium transition-all ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-1 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse"></div>
                )}
              </Link>
            );
          })}

          {/* Preferences Section */}
          {(isSidebarOpen || isDesktop) && (
            <div className="pt-4 sm:pt-8 mt-4 sm:mt-8 border-t border-gray-200/50">
              {isAnyAdmin() && (
                <Link
                  href="/admin/settings"
                  onClick={() => {
                    // Fermer le sidebar sur mobile quand on clique sur un lien
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`group relative flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")
                      ? "bg-[#f08400] text-white shadow-lg shadow-[#f08400]/25 scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                  }`}
                >
                  <Settings className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${pathname === "/admin/settings" || pathname.startsWith("/admin/settings/") ? "rotate-90" : "group-hover:rotate-90"}`} />
                  <span className={`text-xs sm:text-sm font-medium transition-all ${pathname === "/admin/settings" || pathname.startsWith("/admin/settings/") ? 'text-white' : 'text-gray-700'}`}>Settings</span>
                  {(pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")) && (
                    <div className="absolute right-1 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </Link>
              )}
              {canManageUsers() && (
                <Link
                  href="/admin/users"
                  onClick={() => {
                    // Fermer le sidebar sur mobile quand on clique sur un lien
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`group relative flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${pathname === "/admin/users" || pathname.startsWith("/admin/users/")
                      ? "bg-[#f08400] text-white shadow-lg shadow-[#f08400]/25 scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                  }`}
                >
                  <HelpCircle className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${pathname === "/admin/users" || pathname.startsWith("/admin/users/") ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className={`text-xs sm:text-sm font-medium transition-all ${pathname === "/admin/users" || pathname.startsWith("/admin/users/") ? 'text-white' : 'text-gray-700'}`}>Utilisateurs</span>
                  {(pathname === "/admin/users" || pathname.startsWith("/admin/users/")) && (
                    <div className="absolute right-1 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* User Profile Card */}
        <div className="relative z-10 p-2 sm:p-4 border-t border-gray-200/50">
          <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg border border-gray-200/50 relative group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-[#f08400] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                  {userInitials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              {(isSidebarOpen || isDesktop) && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                    {userFullName}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                    {user.email || "Admin"}
                  </div>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 sm:p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userFullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mon Profil
                  </Link>
                </DropdownMenuItem>
                {isAnyAdmin() && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Alerte de vérification pour les propriétaires non vérifiés */}
        {isOwnerNotVerified && showVerificationAlert && (
          <div className="relative bg-yellow-500 border-b border-yellow-600 shadow-lg z-10">
            <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 lg:gap-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-900 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-[11px] sm:text-xs lg:text-sm font-medium text-yellow-900">
                    <span className="font-bold">Votre compte n&apos;est pas encore vérifié.</span>{" "}
                    <span className="hidden sm:inline">Vérifiez votre compte pour publier vos résidences et gagner la confiance des clients.</span>
                    <span className="sm:hidden">Vérifiez votre compte pour publier vos résidences.</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <Link href="/admin/profile?tab=verification" className="flex-1 sm:flex-initial">
                    <Button
                      size="sm"
                      className="w-full sm:w-auto bg-yellow-900 hover:bg-yellow-950 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-[10px] sm:text-xs lg:text-sm h-7 sm:h-8 px-2 sm:px-3"
                      onClick={() => setShowVerificationAlert(false)}
                    >
                      Vérifier mon compte
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVerificationAlert(false)}
                    className="text-yellow-900 hover:bg-yellow-600/20 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <header className="h-auto min-h-[60px] sm:min-h-[70px] lg:h-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-1.5 sm:px-2 lg:px-6 py-1 sm:py-1.5 lg:py-0 flex flex-row items-center justify-between gap-1 sm:gap-1.5 lg:gap-3 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-3 flex-shrink-0">
            {/* Wallet Balance Section */}
            {user && (
              <div className="flex items-center gap-0.5 sm:gap-1 xl:gap-3 2xl:gap-4 px-1 sm:px-1.5 xl:px-3 2xl:px-4 h-7 sm:h-auto sm:py-1 xl:py-1.5 2xl:py-2 bg-gradient-to-r from-[#f08400]/10 to-[#f08400]/5 rounded-md sm:rounded-lg border border-[#f08400]/20 shadow-sm">
                {/* Solde normal */}
                <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 xl:gap-3">
                  <div className="p-0.5 sm:p-1 lg:p-1.5 xl:p-2 bg-[#f08400]/10 rounded sm:rounded-lg">
                    <Wallet className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 text-[#f08400]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="hidden sm:inline text-[8px] lg:text-[10px] xl:text-xs text-gray-500 font-medium leading-tight">Solde</span>
                    <span className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-bold text-gray-900 leading-tight whitespace-nowrap">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        maximumFractionDigits: 0,
                      }).format(Number(user.wallet?.balance) || 0)}
                    </span>
                  </div>
                </div>
                
                {/* Séparateur */}
                <div className="h-3 sm:h-4 lg:h-6 xl:h-8 w-px bg-gray-300"></div>
                
                {/* Solde gelé */}
                <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 xl:gap-3">
                  <div className="p-0.5 sm:p-1 lg:p-1.5 xl:p-2 bg-gray-100 rounded sm:rounded-lg">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 text-gray-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="hidden sm:inline text-[8px] lg:text-[10px] xl:text-xs text-gray-500 font-medium leading-tight">Gelé</span>
                    <span className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-bold text-gray-600 leading-tight whitespace-nowrap">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        maximumFractionDigits: 0,
                      }).format(Number(user.wallet?.frozen_balance) || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <Bell className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* Messages */}
            <button className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600" />
              <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full border border-white"></span>
            </button>

            {/* QR Code Scanner */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 relative group"
              title="Scanner QR code"
            >
              <QrCode className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-600 group-hover:text-[#f08400]" />
            </button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 pl-1 sm:pl-2 lg:pl-3 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                  <div className="text-right hidden lg:block">
                    <div className="text-[11px] xl:text-xs 2xl:text-sm font-semibold text-gray-900 truncate max-w-[100px] xl:max-w-[120px] 2xl:max-w-[150px]">
                      {userFullName}
                    </div>
                    <div className="text-[9px] xl:text-[10px] 2xl:text-xs text-gray-500 truncate max-w-[100px] xl:max-w-[120px] 2xl:max-w-[150px]">
                      {user.email || "Admin"}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-md sm:rounded-lg bg-[#f08400] flex items-center justify-center text-white font-bold text-[10px] sm:text-xs lg:text-sm shadow-md hover:shadow-lg transition-shadow">
                      {userInitials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userFullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mon Profil
                  </Link>
                </DropdownMenuItem>
                {isAnyAdmin() && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* QR Code Scanner Modal */}
      <QRCodeScannerModal open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen} />
    </div>
  );
}

