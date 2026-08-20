"use client";

import type { ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  EstablishmentCard,
  type EstablishmentCardData,
} from "./EstablishmentCard";
import { cn } from "@/lib/utils";

interface OwnerEstablishmentGalleryProps {
  items: EstablishmentCardData[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  className?: string;
  emptyAction?: ReactNode;
}

export function OwnerEstablishmentGallery({
  items,
  isLoading,
  emptyTitle = "Aucun établissement",
  emptyDescription = "Commencez par en ajouter un.",
  onEdit,
  onDelete,
  className,
  emptyAction,
}: OwnerEstablishmentGalleryProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#f08400]" />
        <p className="text-sm text-[#5c574f]">Chargement…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-[#12100c]/12 bg-[#f7f5f1]/60 px-6 py-16 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center bg-[#f08400] text-white">
          <Plus className="h-5 w-5" />
        </div>
        <p className="mt-5 text-lg font-semibold tracking-tight text-[#12100c]">
          {emptyTitle}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#5c574f]">
          {emptyDescription}
        </p>
        {emptyAction ? (
          <div className="mt-6 flex justify-center">{emptyAction}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((item, index) => (
        <EstablishmentCard
          key={item.id}
          item={item}
          index={index}
          onEdit={onEdit ? () => onEdit(item.id) : undefined}
          onDelete={onDelete ? () => onDelete(item.id) : undefined}
        />
      ))}
    </div>
  );
}
