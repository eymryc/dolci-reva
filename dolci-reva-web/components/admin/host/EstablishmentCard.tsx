"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface EstablishmentCardData {
  id: number;
  name: string;
  href: string;
  imageUrl?: string | null;
  location?: string | null;
  priceLabel?: string | null;
  /** Libellé au-dessus du prix (ex. « Par nuit ») */
  priceCaption?: string | null;
  meta?: string | null;
  description?: string | null;
  badges?: string[];
  status?: "available" | "unavailable" | "inactive" | "draft";
  statusLabel?: string;
}

interface EstablishmentCardProps {
  item: EstablishmentCardData;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  index?: number;
}

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
  unavailable: "bg-amber-50 text-amber-900 ring-amber-200/80",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200/80",
  draft: "bg-slate-100 text-slate-600 ring-slate-200/80",
};

export function EstablishmentCard({
  item,
  onEdit,
  onDelete,
  className,
  index = 0,
}: EstablishmentCardProps) {
  const status = item.status || "available";
  const statusClass = STATUS_STYLES[status] || STATUS_STYLES.available;
  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const chips = item.badges?.slice(0, 4) ?? [];

  return (
    <article
      className={cn(
        "group/card flex min-h-[220px] flex-col overflow-hidden border border-[#12100c]/08 bg-white",
        "transition-all duration-500 hover:-translate-y-0.5 hover:border-[#f08400]/35",
        "hover:shadow-[0_24px_50px_-28px_rgba(240,132,0,0.45)]",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-600 fill-mode-both",
        "sm:min-h-[260px] sm:flex-row",
        className
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      {/* Image ~40% — même logique que le listing public */}
      <Link
        href={item.href}
        className="relative h-48 w-full shrink-0 overflow-hidden bg-[#eceae6] sm:h-auto sm:min-h-[260px] sm:w-2/5 sm:min-w-[240px]"
        aria-label={`Ouvrir ${item.name}`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-105"
            sizes="(max-width: 640px) 100vw, 40vw"
            unoptimized
            priority={index < 2}
          />
        ) : (
          <div className="flex h-full min-h-[192px] w-full items-center justify-center bg-gradient-to-br from-[#fff4e8] to-[#ebe7e0] sm:min-h-[260px]">
            <span className="text-2xl font-semibold tracking-[0.22em] text-[#f08400]/35">
              {initials}
            </span>
          </div>
        )}

        {item.statusLabel ? (
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ring-1 ring-inset backdrop-blur-sm",
              statusClass
            )}
          >
            {item.statusLabel}
          </span>
        ) : null}
      </Link>

      {/* Contenu */}
      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-[#5c574f]">
            {item.location ? (
              <>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <p className="truncate text-xs sm:text-sm">{item.location}</p>
              </>
            ) : (
              <span className="text-xs text-[#5c574f]/50">—</span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#f08400] transition-colors hover:text-[#d87200] sm:text-sm"
            >
              Gérer →
            </Link>
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-none p-0 text-[#5c574f] hover:bg-[#f7f5f1] hover:text-[#12100c]"
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[156px] rounded-none border-[#12100c]/10"
                >
                  <DropdownMenuItem asChild className="rounded-none text-xs">
                    <Link href={item.href}>Ouvrir la fiche</Link>
                  </DropdownMenuItem>
                  {onEdit ? (
                    <DropdownMenuItem
                      onClick={onEdit}
                      className="rounded-none text-xs"
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Modifier
                    </DropdownMenuItem>
                  ) : null}
                  {onDelete ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="rounded-none text-xs text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Link href={item.href}>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-[#12100c] transition-colors group-hover/card:text-[#c96d00] sm:text-xl">
            {item.name}
          </h3>
        </Link>

        {item.description ? (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[#5c574f]">
            {item.description}
          </p>
        ) : null}

        {chips.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {chips.map((label) => (
              <span
                key={label}
                className="border border-[#12100c]/08 bg-[#f7f5f1] px-2 py-0.5 text-[11px] font-medium text-[#5c574f]"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 border-t border-[#12100c]/06 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5c574f]">
            {item.meta ? <span>{item.meta}</span> : null}
          </div>

          {item.priceLabel ? (
            <div className="text-left sm:text-right">
              {item.priceCaption ? (
                <p className="text-[11px] uppercase tracking-wide text-[#5c574f]">
                  {item.priceCaption}
                </p>
              ) : null}
              <p className="text-lg font-bold tracking-tight text-[#12100c] sm:text-xl">
                {item.priceLabel}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
