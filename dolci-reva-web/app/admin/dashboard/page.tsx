"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Building2,
  Home,
  Loader2,
  ArrowUpRight,
  UtensilsCrossed,
  Coffee,
  Music2,
  Wine,
  User,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Eye,
  Wallet,
  ShieldCheck,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useStats } from "@/hooks/use-stats";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { useBackofficePath, useIsHostView } from "@/hooks/use-host-view";
import { HostShell } from "@/components/admin/host/HostShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashTab = "overview" | "activity" | "shortcuts";

function greetingForHour(hour: number) {
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isOwner } = usePermissions();
  const isHostView = useIsHostView();
  const bo = useBackofficePath();
  const { data: statsResponse, isLoading } = useStats();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");

  const linkGroups = [
    {
      title: "Hébergement",
      items: [
        { label: "Résidences", href: bo("/residences"), icon: Home },
        { label: "Hébergements", href: bo("/hebergements"), icon: Building2 },
        { label: "Hôtels", href: bo("/hotels"), icon: Building2 },
      ],
    },
    {
      title: "Restauration & nuit",
      items: [
        { label: "Restaurants", href: bo("/restaurants"), icon: UtensilsCrossed },
        { label: "Lounges", href: bo("/lounges"), icon: Coffee },
        { label: "Bars", href: bo("/bars"), icon: Wine },
        { label: "Night-Clubs", href: bo("/night-clubs"), icon: Music2 },
      ],
    },
    {
      title: "Compte",
      items: [{ label: "Mon profil", href: bo("/profile"), icon: User }],
    },
  ];

  const stats = statsResponse || {
    residences: 0,
    hebergements: 0,
    visites: 0,
    reservations: 0,
  };

  const firstName = user?.first_name || "là";
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const totalActivity = stats.residences + stats.hebergements + stats.visites + stats.reservations;
  const walletBalance = user?.wallet?.balance ?? null;
  const needsVerification = isOwner() && !user?.is_verified;

  const metrics = [
    {
      key: "reservations",
      title: "Réservations",
      value: stats.reservations,
      hint: "Confirmées ce mois",
      icon: Calendar,
      href: bo("/bookings"),
      featured: true,
    },
    {
      key: "residences",
      title: "Résidences",
      value: stats.residences,
      hint: "Biens disponibles",
      icon: Home,
      href: bo("/residences"),
      featured: false,
    },
    {
      key: "hebergements",
      title: "Hébergements",
      value: stats.hebergements,
      hint: "Séjours actifs",
      icon: Building2,
      href: bo("/hebergements"),
      featured: false,
    },
    {
      key: "visites",
      title: "Visites",
      value: stats.visites,
      hint: "Demandes en cours",
      icon: Eye,
      href: bo("/dashboard"),
      featured: false,
    },
  ];

  const activityRows = metrics.map((m) => ({
    ...m,
    share: totalActivity ? Math.round((m.value / totalActivity) * 100) : 0,
  }));

  const tabs: { key: DashTab; label: string; short: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Vue d'ensemble", short: "Vue", icon: LayoutDashboard },
    { key: "activity", label: "Activité", short: "Acti.", icon: TrendingUp },
    { key: "shortcuts", label: "Raccourcis", short: "Go", icon: Sparkles },
  ];

  const content = (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      {/* ── Hero ── */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-none border border-orange-100/70 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(240,132,0,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(255,107,53,0.08),_transparent_50%)]" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-theme-primary/20 to-theme-accent/10 blur-3xl" />

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-primary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-theme-primary animate-pulse" />
              Tableau de bord
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            <p className="mt-2 max-w-md text-sm capitalize leading-relaxed text-slate-500">
              {todayLabel}
              <span className="mx-2 text-slate-300">·</span>
              <span className="normal-case">Voici l&apos;état de votre activité Dolci Rêva.</span>
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button
                asChild
                className="h-11 rounded-none bg-gradient-to-r from-theme-primary to-theme-accent px-5 font-semibold text-white shadow-md shadow-theme-primary/25"
              >
                <Link href={bo("/residences")}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Gérer mes biens
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-none border-slate-200 bg-white/80 font-semibold backdrop-blur"
              >
                <Link href={bo("/profile")}>
                  <User className="mr-1.5 h-4 w-4 text-theme-primary" />
                  Mon profil
                </Link>
              </Button>
            </div>
          </div>

          {/* Side status panel */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-none border border-orange-100 bg-white/90 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Activité totale</p>
                <TrendingUp className="h-4 w-4 text-theme-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-theme-primary" /> : totalActivity}
              </p>
              <p className="mt-1 text-xs text-slate-500">Somme des indicateurs clés</p>
            </motion.div>

            {walletBalance != null ? (
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-none border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600/80">Wallet</p>
                  <Wallet className="h-4 w-4 text-theme-primary" />
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {formatMoney(walletBalance)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Solde disponible</p>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-none border border-slate-100 bg-slate-50/80 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Compte</p>
                  <ShieldCheck className="h-4 w-4 text-theme-primary" />
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {user?.is_verified ? "Identité vérifiée" : "Vérification en attente"}
                </p>
                <Link
                  href={bo("/profile") + "?tab=verification"}
                  className="mt-2 inline-flex items-center text-xs font-semibold text-theme-primary hover:underline"
                >
                  Voir le profil <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {needsVerification && (
          <div className="relative border-t border-orange-100 bg-orange-50/60 px-5 py-3 sm:px-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-theme-primary">Action requise :</span>{" "}
                finalisez votre vérification d&apos;identité pour publier vos services.
              </p>
              <Link
                href={bo("/profile") + "?tab=verification"}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-theme-primary hover:underline"
              >
                Vérifier maintenant <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </motion.header>

      {/* ── Tabs ── */}
      <div className="space-y-5">
        <div className="relative flex gap-1 rounded-none border border-slate-200/80 bg-white p-1.5 shadow-sm">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-none px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4",
                  active ? "text-white" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="dash-tab-pill"
                    className="absolute inset-0 rounded-none bg-gradient-to-r from-theme-primary to-theme-accent shadow-md shadow-theme-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW — bento */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="grid gap-4 lg:grid-cols-3"
            >
              {/* Featured */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="lg:col-span-2"
              >
                <Link
                  href={bo("/dashboard")}
                  className="group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-none bg-gradient-to-br from-theme-primary via-orange-500 to-theme-accent p-6 text-white shadow-lg shadow-theme-primary/25 sm:p-7"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
                        Indicateur phare
                      </p>
                      <h2 className="mt-1 text-xl font-bold sm:text-2xl">Réservations du mois</h2>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-none bg-white/15 backdrop-blur">
                      <Calendar className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <p className="text-5xl font-bold tracking-tight sm:text-6xl">
                      {isLoading ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                      ) : (
                        stats.reservations
                      )}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-white/80">
                      Confirmées sur la période
                      <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </p>
                  </div>
                </Link>
              </motion.div>

              {/* Side stack */}
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {metrics
                  .filter((m) => !m.featured)
                  .map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <motion.div
                        key={m.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.05 }}
                        whileHover={{ y: -3 }}
                      >
                        <Link
                          href={m.href}
                          className="group flex items-center gap-3 rounded-none border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/10"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-orange-50 text-theme-primary transition-colors group-hover:bg-gradient-to-br group-hover:from-theme-primary group-hover:to-theme-accent group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-500">{m.title}</p>
                            <p className="text-xl font-bold text-slate-900">
                              {isLoading ? "—" : m.value}
                            </p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-theme-primary" />
                        </Link>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Bottom insight strip */}
              <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
                {[
                  {
                    label: "Parc immobilier",
                    value: stats.residences + stats.hebergements,
                    sub: "Résidences + hébergements",
                  },
                  {
                    label: "Pipeline",
                    value: stats.visites + stats.reservations,
                    sub: "Visites + réservations",
                  },
                  {
                    label: "Taux résas / total",
                    value: totalActivity
                      ? `${Math.round((stats.reservations / totalActivity) * 100)}%`
                      : "0%",
                    sub: "Part des réservations",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="rounded-none border border-slate-100 bg-white px-5 py-4 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {isLoading ? "—" : item.value}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.sub}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ACTIVITY */}
          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden rounded-none border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-none bg-gradient-to-br from-theme-primary to-theme-accent text-white shadow-md shadow-theme-primary/25">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Répartition</h2>
                    <p className="text-xs text-slate-500">Poids de chaque indicateur dans l&apos;activité</p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-theme-primary">
                  {totalActivity} total
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {activityRows.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <motion.div
                      key={row.key}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={row.href}
                        className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-orange-50/40 sm:flex-row sm:items-center sm:px-6"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-none bg-orange-50 text-theme-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{row.title}</p>
                            <p className="text-xs text-slate-500">{row.hint}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:w-[45%]">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${row.share}%` }}
                              transition={{ delay: 0.15 + i * 0.08, duration: 0.65, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-theme-primary to-theme-accent"
                            />
                          </div>
                          <div className="w-16 text-right">
                            <p className="text-sm font-bold text-slate-900">{isLoading ? "—" : row.value}</p>
                            <p className="text-[10px] font-semibold text-theme-primary">{row.share}%</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <motion.div
              key="shortcuts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="space-y-4"
            >
              {linkGroups.map((group, gi) => (
                <motion.section
                  key={group.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.06 }}
                  className="overflow-hidden rounded-none border border-slate-200/80 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 px-5 py-3.5">
                    <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                      {group.title}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          className="group flex items-center gap-3 bg-white px-4 py-4 transition-colors hover:bg-orange-50/50"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-none bg-orange-50 text-theme-primary transition-all group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-theme-primary group-hover:to-theme-accent group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="flex-1 text-sm font-semibold text-slate-800">{item.label}</span>
                          <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-theme-primary" />
                        </Link>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isHostView) {
    return <HostShell>{content}</HostShell>;
  }
  return content;
}