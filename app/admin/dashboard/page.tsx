"use client";

import React, { useMemo } from "react";
import { Search, TrendingUp, ArrowRight, Calendar, DollarSign, Users, Sparkles, Activity, Loader2 } from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingTable } from "@/components/admin/bookings/BookingTable";

export default function DashboardPage() {
  const { isAnyAdmin, isOwner, isCustomer } = usePermissions();
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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828] mb-2">
            {isAnyAdmin() ? "Tableau de bord des réservations" : "Mes réservations"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {isAnyAdmin() 
              ? "Bienvenue ! Voici ce qui se passe aujourd'hui." 
              : isOwner() 
                ? "Gérez vos réservations et vos résidences."
                : isCustomer()
                  ? "Bienvenue ! Voici vos réservations."
                  : "Bienvenue ! Voici vos réservations."}
          </p>
        </div>
        <div className="relative group w-full sm:w-auto">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-[#f08400] transition-colors" />
          <input
            type="text"
            placeholder="Rechercher des réservations, lieux..."
            className="w-full sm:w-64 lg:w-80 pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#f08400] focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* New Booking Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-[#f08400] rounded-lg sm:rounded-xl shadow-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Nouvelles réservations</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828]">
                {isLoadingBookings ? (
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#f08400]" />
                ) : (
                  stats.totalBookings
                )}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-[#f08400] rounded-lg sm:rounded-xl shadow-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Revenu total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#101828] break-words">
                {isLoadingBookings ? (
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#f08400]" />
                ) : (
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.totalRevenue)
                )}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Total Reserved Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-[#f08400] rounded-lg sm:rounded-xl shadow-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Réservations confirmées</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828]">
                {isLoadingBookings ? (
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#f08400]" />
                ) : (
                  <>
                    {stats.confirmedBookings} <span className="text-base sm:text-lg lg:text-xl text-gray-500 font-normal">/ {stats.totalBookings}</span>
                  </>
                )}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Status Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-[#f08400] rounded-lg sm:rounded-xl shadow-lg">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Statuts</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Confirmé:</span>
                  <span className="font-semibold text-green-600">{stats.confirmedBookings}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">En attente:</span>
                  <span className="font-semibold text-yellow-600">{stats.pendingBookings}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Annulé:</span>
                  <span className="font-semibold text-red-600">{stats.cancelledBookings}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Terminé:</span>
                  <span className="font-semibold text-blue-600">{stats.completedBookings}</span>
                </div>
              </div>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Booking List Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#f08400] rounded-lg shadow-md">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#101828]">
              Liste des réservations
            </h2>
          </div>
        </div>
        {isLoadingBookings ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
            <p className="text-gray-500 text-sm">Chargement des réservations...</p>
                  </div>
        ) : (
          <BookingTable
            data={bookings}
            onCancel={() => {}}
            onDelete={() => {}}
            isLoading={isLoadingBookings}
            onRefresh={() => refetchBookings()}
            isRefreshing={isRefetchingBookings}
          />
        )}
      </div>
    </div>
  );
}

