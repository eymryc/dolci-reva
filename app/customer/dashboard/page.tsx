"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Loader2,
  CreditCard,
  Star,
  TrendingUp,
  Package
} from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CustomerDashboardPage() {
  const { isCustomer } = usePermissions();
  const { 
    data: bookingsResponse, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const bookings = bookingsResponse?.data || [];
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRME').length;
    const pendingBookings = bookings.filter(b => b.status === 'EN_ATTENTE').length;
    const cancelledBookings = bookings.filter(b => b.status === 'ANNULE').length;
    const completedBookings = bookings.filter(b => b.status === 'TERMINE').length;
    
    const totalRevenue = bookings
      .filter(b => b.status === 'CONFIRME' || b.status === 'TERMINE')
      .reduce((sum, b) => sum + parseFloat(b.total_price || '0'), 0);
    
    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
    };
  }, [bookingsResponse?.data]);

  const bookings = bookingsResponse?.data || [];

  if (!isCustomer()) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Accès refusé</h1>
        <p className="text-gray-600">Vous devez être connecté en tant que client pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Hero Section */}
      <section className="relative mb-16 overflow-hidden bg-gradient-to-br from-theme-primary via-theme-primary/90 to-theme-accent rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
            {/* Left side - Content */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                Mon Espace Client
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                Gérez vos réservations, consultez votre historique et profitez de nos services exclusifs.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/residences">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-theme-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Explorer les résidences
                  </Button>
                </Link>
                <Link href="/customer/bookings">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white/10 border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Mes réservations
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side - Vue d'ensemble Cards */}
            <div className="w-full lg:w-auto lg:min-w-[500px]">
              <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">Vue d&apos;ensemble</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Total Bookings Card */}
                <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-theme-primary/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/30 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/80 mb-1">Total réservations</p>
                      <p className="text-2xl font-bold text-white">
                        {isLoadingBookings ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          stats.totalBookings
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirmed Bookings Card */}
                <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <Badge className="bg-green-500/80 text-white border-0 text-xs">Confirmé</Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/80 mb-1">Confirmées</p>
                      <p className="text-2xl font-bold text-white">
                        {isLoadingBookings ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          stats.confirmedBookings
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending Bookings Card */}
                <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/30 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <Badge className="bg-yellow-500/80 text-white border-0 text-xs">En attente</Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/80 mb-1">En attente</p>
                      <p className="text-2xl font-bold text-white">
                        {isLoadingBookings ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          stats.pendingBookings
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Spent Card */}
                <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/30 rounded-lg">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <Star className="w-4 h-4 text-white fill-white/80" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/80 mb-1">Total dépensé</p>
                      <p className="text-lg font-bold text-white">
                        {isLoadingBookings ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.totalRevenue)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mes réservations récentes</h2>
          <Link href="/customer/bookings">
            <Button variant="outline" className="hover:bg-theme-primary hover:text-white transition-all duration-300">
              Voir toutes les réservations
            </Button>
          </Link>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          {isLoadingBookings ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-theme-primary mb-4" />
              <p className="text-gray-500 text-sm">Chargement des réservations...</p>
            </div>
          ) : bookings.length > 0 ? (
            <BookingTable
              data={bookings.slice(0, 5)}
              onCancel={() => {}}
              onDelete={() => {}}
              isLoading={false}
              onRefresh={() => refetchBookings()}
              isRefreshing={isRefetchingBookings}
              canCancel={true}
              canDelete={false}
            />
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réservation</h3>
              <p className="text-gray-600 mb-6">Vous n&apos;avez pas encore de réservations.</p>
              <Link href="/residences">
                <Button className="bg-theme-primary hover:bg-theme-primary/90 text-white">
                  Explorer les résidences
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

