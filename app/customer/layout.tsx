"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import MainHeader from "@/components/ui/MainHeader";
import MainFooter from "@/components/ui/MainFooter";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { isCustomer, canAccessAdminPanel } = usePermissions();
  const isLoginPage = pathname?.includes("/auth/");

  // Vérifier les permissions
  const isCustomerUser = isCustomer();
  const hasAdminAccess = canAccessAdminPanel();

  // Rediriger si l'utilisateur n'est pas un client
  useEffect(() => {
    // Ne rien faire si on est en train de charger ou si c'est une page d'authentification
    if (loading || isLoginPage) return;
    
    // Si pas d'utilisateur, rediriger vers la page de connexion
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }
    
    // Si l'utilisateur n'est ni un client ni un admin, rediriger vers la page d'accueil
    if (!isCustomerUser && !hasAdminAccess) {
      router.push("/");
    }
  }, [loading, user, isCustomerUser, hasAdminAccess, router, isLoginPage]);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si c'est une page d'authentification, ne pas afficher le header/footer
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <section className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <MainHeader />
      <main className="flex-1">{children}</main>
      <MainFooter />
    </section>
  );
}

