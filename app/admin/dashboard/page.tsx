"use client";

import React, { useMemo } from "react";
import {
  TrendingUp,
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  Loader2,
  CreditCard,
  Building2,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { usePermissions } from "@/hooks/use-permissions";
import { BookingTable } from "@/components/admin/bookings/BookingTable";
import { useAuth } from "@/context/AuthContext";

type BookingLite = {
  id?: number;
  reference?: string;
  status?: string;
  status_label?: string;
  total_price?: string;
  dwelling?: {
    address?: string;
    city?: string;
  };
  scheduled_at?: string;
  check_in_date?: string;
  created_at?: string;
};

export default function DashboardPage() {
  const { isAnyAdmin, isOwner, isCustomer } = usePermissions();
  const { user } = useAuth();
  const {
    data: bookingsResponse,
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
    isRefetching: isRefetchingBookings,
  } = useBookings(1);

  const stats = useMemo(() => {
    const collection = (bookingsResponse?.data as BookingLite[]) ?? [];
    const totalBookings = collection.length;
    const confirmedBookings = collection.filter((b) => b.status === "CONFIRME").length;
    const pendingBookings = collection.filter((b) => b.status === "EN_ATTENTE").length;
    const cancelledBookings = collection.filter((b) => b.status === "ANNULE").length;
    const completedBookings = collection.filter((b) => b.status === "TERMINE").length;
    const totalRevenue = collection
      .filter((b) => b.status === "CONFIRME" || b.status === "TERMINE")
      .reduce((sum, b) => sum + parseFloat(b.total_price || "0"), 0);

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
    };
  }, [bookingsResponse?.data]);

  const typedBookings = (bookingsResponse?.data as BookingLite[]) ?? [];
  const bookingsData = bookingsResponse?.data ?? [];
  const walletBalance = Number(user?.wallet?.balance) || 0;
  const rechargeBalance = Number(user?.wallet?.recharge_balance) || 0;
  const frozenBalance = Number(user?.wallet?.frozen_balance) || 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value);

  const serviceHighlights = [
    {
      title: "Résidences",
      description: "Demandes de visite & réservations",
      icon: Building2,
      value: stats.confirmedBookings,
      subValue: stats.totalBookings,
      subtitle: "confirmées / totales",
    },
    {
      title: "Hébergements",
      description: "Séjours programmés & en attente",
      icon: Calendar,
      value: stats.pendingBookings,
      subValue: stats.completedBookings,
      subtitle: "en attente / terminées",
    },
  ];

  const conversionRate = stats.totalBookings
    ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100)
    : 0;
  const cancellationRate = stats.totalBookings
    ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100)
    : 0;
  const pendingRate = stats.totalBookings
    ? Math.round((stats.pendingBookings / stats.totalBookings) * 100)
    : 0;

  const recentBookings = typedBookings.slice(0, 4);

  const quickActions = [
    {
      title: "Nouvelle résidence",
      description: "Publier un bien ou un hébergement",
      icon: Building2,
    },
    {
      title: "Planifier une visite",
      description: "Coordonner une visite guidée",
      icon: Calendar,
    },
    {
      title: "Recharger le wallet",
      description: "Initier un dépôt sécurisé",
      icon: CreditCard,
    },
  ];

  const operationsPipeline = [
    {
      title: "Visites à confirmer",
      count: stats.pendingBookings,
      description: "Demandes clients en attente de validation",
      tone: "warning",
    },
    {
      title: "Séjours en cours",
      count: stats.confirmedBookings,
      description: "Check-in / check-out du jour",
      tone: "info",
    },
    {
      title: "Dossiers résidences",
      count: stats.totalBookings,
      description: "Nouvelles demandes propriétaires",
      tone: "success",
    },
  ];

  const financeBreakdown = [
    {
      label: "Solde principal",
      value: formatCurrency(walletBalance),
      hint: "+12% ce mois-ci",
    },
    {
      label: "Recharges en cours",
      value: formatCurrency(rechargeBalance),
      hint: "2 paiements en attente",
    },
    {
      label: "Solde gelé",
      value: formatCurrency(frozenBalance),
      hint: "Sécurités propriétaires",
    },
  ];

  const recentActivity = recentBookings.map((booking) => ({
    id: booking?.id ?? booking?.reference ?? Math.random(),
    title:
      booking?.dwelling?.address ||
      booking?.dwelling?.city ||
      booking?.reference ||
      `Réservation #${booking?.id ?? ""}`,
    status: booking?.status_label || booking?.status || "En attente",
    date:
      booking?.scheduled_at ||
      booking?.check_in_date ||
      booking?.created_at ||
      null,
  }));

  const statCards = [
    {
      title: "Demandes actives",
      value: stats.pendingBookings,
      description: "Visites & réservations en file",
      trend: `+${pendingRate}%`,
      icon: Calendar,
    },
    {
      title: "Réservations confirmées",
      value: stats.confirmedBookings,
      description: "Prêtes à être honorées",
      trend: `${conversionRate}% de conversion`,
      icon: Users,
    },
    {
      title: "Revenus encaissés",
      value: formatCurrency(stats.totalRevenue),
      description: "Confirmé + terminé",
      trend: "+18% vs dernier mois",
      icon: DollarSign,
    },
    {
      title: "Annulations",
      value: stats.cancelledBookings,
      description: "À analyser rapidement",
      trend: `${cancellationRate}% du volume`,
      icon: AlertTriangle,
    },
  ];

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Date à confirmer";
    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date à confirmer";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-[#fff8f0] p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">Services actifs</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#101828]">
              {isAnyAdmin() ? "Résidences & Hébergements" : "Mes réservations"}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {isAnyAdmin()
                ? "Pilotez visites, réservations et flux financiers d’un seul coup d’œil."
                : isOwner()
                  ? "Gérez vos publics, visites et réservations."
                  : isCustomer()
                    ? "Retrouvez vos réservations et demandes en cours."
                    : "Suivez vos réservations et transactions."}
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Visites suivies</p>
              <p className="text-2xl font-bold text-[#f08400]">{stats.pendingBookings}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Séjours confirmés</p>
              <p className="text-2xl font-bold text-[#101828]">{stats.confirmedBookings}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Solde principal</p>
              <p className="text-2xl font-bold text-[#101828]">{formatCurrency(walletBalance)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.title}
              type="button"
              className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#f08400]/60 hover:shadow-md"
            >
              <div className="p-2 rounded-lg bg-[#f08400]/10 text-[#f08400]">
                <action.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#101828]">{action.title}</p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
              <ArrowRight className="ml-auto w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-[#f08400]/10 text-[#f08400]">
                <card.icon className="w-4 h-4" />
              </div>
              <TrendingUp className="w-4 h-4 text-[#f08400]" />
            </div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{card.title}</p>
            <p className="mt-1 text-2xl font-bold text-[#101828]">
              {isLoadingBookings ? <Loader2 className="w-5 h-5 animate-spin text-[#f08400]" /> : card.value}
            </p>
            <p className="text-xs text-gray-500">{card.description}</p>
            <p className="mt-3 text-xs font-semibold text-[#f08400]">{card.trend}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Focus services</p>
                  <h2 className="text-lg font-bold text-[#101828]">Résidences / Hébergements</h2>
                </div>
                <Users className="w-5 h-5 text-[#f08400]" />
              </div>
              <div className="space-y-3">
                {serviceHighlights.map((service) => (
                  <div
                    key={service.title}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:border-[#f08400]/40"
                  >
                    <div className="p-2 rounded-lg bg-[#f08400]/10 text-[#f08400]">
                      <service.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm font-semibold text-[#101828]">
                        <span>{service.title}</span>
                        <span className="text-xs text-[#f08400]">Actif</span>
                      </div>
                      <p className="text-xs text-gray-500">{service.description}</p>
                      <p className="mt-2 text-lg font-bold text-[#101828]">
                        {service.value}
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {service.subtitle}: {service.subValue}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Pipeline opérations</p>
                  <h2 className="text-lg font-bold text-[#101828]">Tâches prioritaires</h2>
                </div>
                <ClipboardList className="w-5 h-5 text-[#f08400]" />
              </div>
              <div className="space-y-3">
                {operationsPipeline.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <div
                      className={`p-2 rounded-full ${
                        item.tone === "warning"
                          ? "bg-yellow-50 text-yellow-600"
                          : item.tone === "success"
                            ? "bg-green-50 text-green-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {item.tone === "success" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : item.tone === "warning" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Clock3 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm font-semibold text-[#101828]">
                        <span>{item.title}</span>
                        <span className="text-base text-[#101828]">{item.count}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#f08400]/10 text-[#f08400]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Réservations</p>
                  <h2 className="text-xl font-bold text-[#101828]">Vue rapide</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => refetchBookings()}
                className="text-xs font-semibold text-[#f08400] hover:text-[#d87200]"
              >
                Actualiser
              </button>
            </div>
            {isLoadingBookings ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-[#f08400] mb-4" />
                <p className="text-gray-500 text-sm">Chargement des réservations...</p>
              </div>
            ) : (
              <BookingTable
                data={bookingsData}
                onCancel={() => {}}
                onDelete={() => {}}
                isLoading={isLoadingBookings}
                onRefresh={() => refetchBookings()}
                isRefreshing={isRefetchingBookings}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-[#f08400] to-[#d87200] p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/80 font-semibold">Finances</p>
                <h2 className="text-xl font-bold">Suivi Wallet & Recharges</h2>
              </div>
              <CreditCard className="w-6 h-6 text-white/90" />
            </div>
            <div className="space-y-4">
              {financeBreakdown.map((line) => (
                <div key={line.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">{line.label}</p>
                    <p className="text-xs text-white/70">{line.hint}</p>
                  </div>
                  <p className="text-lg font-bold">{line.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/80">
              Utilisez le bouton « Recharger le solde » de l’entête pour initier un dépôt sécurisé.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Activité récente</p>
              <h2 className="text-lg font-bold text-[#101828]">Dernières actions</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune activité récente. Les nouvelles réservations apparaîtront ici.</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-[#f08400]" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#101828]">{activity.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#f08400]">{activity.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
