"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  MoreVertical,
  MessageSquare,
  Bell,
  Search,
  Menu,
  LogOut,
  Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Résidences", icon: Home, href: "/admin/residences" },
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
  const isSidebarOpen = true;
  const isLoginPage = pathname === "/admin/login";

  // Fonction pour déconnecter l'utilisateur
  const handleLogout = () => {
    logout();
    // Utiliser setTimeout pour éviter l'erreur de mise à jour pendant le rendu
    setTimeout(() => {
      router.push("/admin/login");
    }, 0);
  };

  // Rediriger vers la page de login si pas d'utilisateur (après le chargement)
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [loading, user, isLoginPage, router]);

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
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-72" : "w-20"
        } relative z-10 transition-all duration-300 flex flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl`}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[#f08400]/5 pointer-events-none"></div>
        
        {/* Logo */}
        <div className="relative z-10 h-20 flex items-center px-6 border-b border-gray-200/50">
          <div className="font-bold text-2xl text-[#f08400]">
            RomBok
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#f08400] text-white shadow-lg shadow-[#f08400]/25 scale-[1.02]"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isSidebarOpen && (
                  <span className={`text-sm font-medium transition-all ${isActive ? 'text-white' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-white animate-pulse"></div>
                )}
              </Link>
            );
          })}

          {/* Preferences Section */}
          {isSidebarOpen && (
            <div className="pt-8 mt-8 border-t border-gray-200/50">
              <div className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Preferences
              </div>
              <Link
                href="/admin/settings"
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === "/admin/settings"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                }`}
              >
                <Settings className={`w-5 h-5 transition-transform duration-300 ${pathname === "/admin/settings" ? "rotate-90" : "group-hover:rotate-90"}`} />
                <span className="text-sm font-medium">Settings</span>
                {pathname === "/admin/settings" && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-white animate-pulse"></div>
                )}
              </Link>
              <Link
                href="/admin/users"
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === "/admin/users"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md"
                }`}
              >
                <HelpCircle className={`w-5 h-5 transition-transform duration-300 ${pathname === "/admin/users" ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="text-sm font-medium">Utilisateurs</span>
                {pathname === "/admin/users" && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-white animate-pulse"></div>
                )}
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile Card */}
        <div className="relative z-10 p-4 border-t border-gray-200/50">
          <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 relative group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#f08400] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {userInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {userFullName}
                  </div>
                  <div className="text-xs text-gray-500 font-medium truncate">
                    {user.email || "Admin"}
                  </div>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <MoreVertical className="w-4 h-4" />
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
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative hidden md:block flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f08400] focus:bg-white transition-all text-sm h-12"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* Messages */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                      {userFullName}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                      {user.email || "Admin"}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-[#f08400] flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow">
                      {userInitials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
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
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

