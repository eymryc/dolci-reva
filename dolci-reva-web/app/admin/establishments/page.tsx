"use client";

import Link from "next/link";
import {
  Home,
  Building2,
  UtensilsCrossed,
  Coffee,
  Wine,
  Music2,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { HostShell } from "@/components/admin/host/HostShell";
import { cn } from "@/lib/utils";
import { hostPath } from "@/lib/host-paths";

type Tone = {
  card: string;
  border: string;
  iconBg: string;
  iconFg: string;
  accent: string;
  glow: string;
  bar: string;
};

const TONES = {
  orange: {
    card: "bg-gradient-to-br from-[#fff4e8] via-[#fffaf5] to-white",
    border: "border-[#f08400]/25 hover:border-[#f08400]/55",
    iconBg: "bg-[#f08400]",
    iconFg: "text-white",
    accent: "group-hover:text-[#c96d00]",
    glow: "bg-[#f08400]/15",
    bar: "from-[#f08400] to-[#ffb347]",
  },
  amber: {
    card: "bg-gradient-to-br from-[#fff8eb] via-[#fffdf8] to-white",
    border: "border-amber-300/50 hover:border-amber-400/70",
    iconBg: "bg-amber-500",
    iconFg: "text-white",
    accent: "group-hover:text-amber-700",
    glow: "bg-amber-400/20",
    bar: "from-amber-500 to-amber-300",
  },
  peach: {
    card: "bg-gradient-to-br from-[#fff0e6] via-[#fff9f4] to-white",
    border: "border-orange-200/70 hover:border-orange-300",
    iconBg: "bg-[#e87830]",
    iconFg: "text-white",
    accent: "group-hover:text-[#c45e18]",
    glow: "bg-orange-400/15",
    bar: "from-[#e87830] to-[#f0a060]",
  },
  coral: {
    card: "bg-gradient-to-br from-[#fff1ea] via-[#fffaf7] to-white",
    border: "border-[#f08400]/30 hover:border-[#f08400]/50",
    iconBg: "bg-[#d96a2b]",
    iconFg: "text-white",
    accent: "group-hover:text-[#b8541f]",
    glow: "bg-[#f08400]/12",
    bar: "from-[#d96a2b] to-[#f08400]",
  },
  gold: {
    card: "bg-gradient-to-br from-[#fff9e8] via-[#fffef8] to-white",
    border: "border-yellow-300/40 hover:border-yellow-400/60",
    iconBg: "bg-[#d4a017]",
    iconFg: "text-white",
    accent: "group-hover:text-[#a67c00]",
    glow: "bg-yellow-400/15",
    bar: "from-[#d4a017] to-[#f0c75e]",
  },
  wine: {
    card: "bg-gradient-to-br from-[#fff5ee] via-[#fffbf8] to-white",
    border: "border-[#e07a3a]/30 hover:border-[#e07a3a]/50",
    iconBg: "bg-[#c45c26]",
    iconFg: "text-white",
    accent: "group-hover:text-[#9a4518]",
    glow: "bg-[#e07a3a]/12",
    bar: "from-[#c45c26] to-[#e8955a]",
  },
  night: {
    card: "bg-gradient-to-br from-[#2a2118] via-[#1f1914] to-[#161210]",
    border: "border-[#f08400]/35 hover:border-[#f08400]/60",
    iconBg: "bg-[#f08400]",
    iconFg: "text-white",
    accent: "group-hover:text-[#ffb347]",
    glow: "bg-[#f08400]/25",
    bar: "from-[#f08400] to-[#ffb347]",
  },
} as const satisfies Record<string, Tone>;

type ToneKey = keyof typeof TONES;

const CATEGORIES: {
  name: string;
  description: string;
  href: string;
  icon: typeof Home;
  tone: ToneKey;
}[] = [
  {
    name: "Résidences",
    description: "Appartements, villas et studios à la nuit",
    href: hostPath("/residences"),
    icon: Home,
    tone: "orange",
  },
  {
    name: "Hébergements",
    description: "Logements longue durée et visites",
    href: hostPath("/hebergements"),
    icon: Home,
    tone: "amber",
  },
  {
    name: "Hôtels",
    description: "Établissements et chambres",
    href: hostPath("/hotels"),
    icon: Building2,
    tone: "peach",
  },
  {
    name: "Restaurants",
    description: "Tables, menus et réservations",
    href: hostPath("/restaurants"),
    icon: UtensilsCrossed,
    tone: "coral",
  },
  {
    name: "Lounges",
    description: "Espaces lounge et produits",
    href: hostPath("/lounges"),
    icon: Coffee,
    tone: "gold",
  },
  {
    name: "Bars",
    description: "Bars et soirées",
    href: hostPath("/bars"),
    icon: Wine,
    tone: "wine",
  },
  {
    name: "Night-Clubs",
    description: "Clubs et zones",
    href: hostPath("/night-clubs"),
    icon: Music2,
    tone: "night",
  },
];

function SuccessCard({
  item,
}: {
  item: (typeof CATEGORIES)[number];
}) {
  const Icon = item.icon;
  const tone = TONES[item.tone];
  const isDark = item.tone === "night";

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex min-h-[158px] flex-col justify-between overflow-hidden border p-5 transition-all duration-300 sm:p-6",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(240,132,0,0.55)]",
        tone.card,
        tone.border
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full blur-2xl transition-opacity duration-500",
          tone.glow,
          "opacity-70 group-hover:opacity-100"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-80 transition-opacity group-hover:opacity-100",
          tone.bar
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center shadow-[0_8px_20px_-8px_rgba(240,132,0,0.65)] transition-transform duration-300 group-hover:scale-105",
            tone.iconBg,
            tone.iconFg
          )}
        >
          <Icon className="h-5 w-5" />
          <CheckCircle2
            className={cn(
              "absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white p-px text-emerald-500 shadow-sm",
              isDark && "bg-[#1f1914]"
            )}
          />
        </div>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center transition-all duration-300",
            isDark
              ? "bg-white/10 text-white group-hover:bg-[#f08400]"
              : "bg-white/80 text-slate-500 shadow-sm group-hover:bg-[#f08400] group-hover:text-white",
            "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          )}
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="relative mt-5">
        <h2
          className={cn(
            "text-lg font-semibold tracking-tight transition-colors",
            isDark ? "text-white" : "text-slate-900",
            tone.accent
          )}
        >
          {item.name}
        </h2>
        <p
          className={cn(
            "mt-1.5 text-[13px] leading-relaxed",
            isDark ? "text-white/65" : "text-slate-600"
          )}
        >
          {item.description}
        </p>
      </div>
    </Link>
  );
}

export default function EstablishmentsHubPage() {
  return (
    <HostShell>
      <div className="mx-auto w-full max-w-6xl">
        <header className="max-w-xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f08400]">
            Espace hôte
          </p>
          <h1 className="text-[1.85rem] font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-[2.35rem]">
            Mes établissements
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
            Choisissez une catégorie pour gérer vos lieux.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORIES.map((item) => (
            <SuccessCard key={item.href} item={item} />
          ))}
        </div>
      </div>
    </HostShell>
  );
}
