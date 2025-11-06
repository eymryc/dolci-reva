"use client";

import React, { useMemo } from "react";
import { Search, TrendingUp, ArrowRight, Calendar, DollarSign, Users, Sparkles, Activity, Loader2 } from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { BookingTable } from "@/components/admin/bookings/BookingTable";

export default function DashboardPage() {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#101828] mb-2">
            Tableau de bord des réservations
          </h1>
          <p className="text-gray-500 text-sm">Bienvenue ! Voici ce qui se passe aujourd&apos;hui.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#f08400] transition-colors" />
          <input
            type="text"
            placeholder="Rechercher des réservations, lieux..."
            className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#f08400] focus:border-transparent w-80 shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* New Booking Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-2xl p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#f08400] rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">Nouvelles réservations</p>
              <p className="text-4xl font-bold text-[#101828]">
                {isLoadingBookings ? (
                  <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
                ) : (
                  stats.totalBookings
                )}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-2xl p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#f08400] rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">Revenu total</p>
              <p className="text-4xl font-bold text-[#101828]">
                {isLoadingBookings ? (
                  <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
                ) : (
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.totalRevenue)
                )}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Total Reserved Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-2xl p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#f08400] rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">Réservations confirmées</p>
              <p className="text-4xl font-bold text-[#101828]">
                {isLoadingBookings ? (
                  <Loader2 className="w-8 h-8 animate-spin text-[#f08400]" />
                ) : (
                  <>
                    {stats.confirmedBookings} <span className="text-xl text-gray-500 font-normal">/ {stats.totalBookings}</span>
                  </>
                )}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Status Card */}
        <div className="group relative overflow-hidden bg-[#f08400]/5 rounded-2xl p-6 shadow-lg border border-[#f08400]/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f08400]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#f08400] rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#f08400] shadow-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+20%</span>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 mb-1">Statuts</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Confirmé:</span>
                  <span className="font-semibold text-green-600">{stats.confirmedBookings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">En attente:</span>
                  <span className="font-semibold text-yellow-600">{stats.pendingBookings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Annulé:</span>
                  <span className="font-semibold text-red-600">{stats.cancelledBookings}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Terminé:</span>
                  <span className="font-semibold text-blue-600">{stats.completedBookings}</span>
                </div>
              </div>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#f08400] hover:text-[#f08400]/80 group-hover:gap-3 transition-all duration-200"
            >
              Voir les détails
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Booking List Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f08400] rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#101828]">
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

