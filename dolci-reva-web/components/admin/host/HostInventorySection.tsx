"use client";

import type { ReactNode } from "react";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveStatusBadge } from "@/components/admin/shared/ActiveStatusBadge";

export type HostInventoryItem = {
  id: number;
  title: string;
  subtitle?: string;
  meta?: string;
  active?: boolean;
};

interface HostInventorySectionProps {
  eyebrow: string;
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  items: HostInventoryItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  icon?: ReactNode;
}

export function HostInventorySection({
  eyebrow,
  title,
  description,
  addLabel,
  onAdd,
  isLoading,
  emptyTitle,
  emptyDescription,
  items,
  onEdit,
  onDelete,
  icon,
}: HostInventorySectionProps) {
  return (
    <section className="border border-[#f08400]/20 bg-gradient-to-br from-[#fff4e8]/70 via-white to-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f08400]">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Button
          type="button"
          onClick={onAdd}
          className="h-11 rounded-none bg-[#f08400] px-5 font-semibold text-white hover:bg-[#d87200]"
        >
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#f08400]" />
          <p className="text-sm text-slate-500">Chargement…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#f08400]/25 bg-white/80 px-5 py-12 text-center">
          {icon}
          <p className="mt-4 text-base font-semibold text-slate-900">{emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {emptyDescription}
          </p>
          <Button
            type="button"
            onClick={onAdd}
            className="mt-6 h-10 rounded-none bg-[#f08400] text-white hover:bg-[#d87200]"
          >
            {addLabel}
          </Button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[#f08400]/10 border border-[#f08400]/10 bg-white">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[15px] font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <ActiveStatusBadge active={item.active !== false} />
                </div>
                {item.subtitle ? (
                  <p className="mt-0.5 text-[12px] text-slate-500">{item.subtitle}</p>
                ) : null}
                {item.meta ? (
                  <p className="mt-1 text-sm font-medium text-slate-800">{item.meta}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-none border-slate-200 px-2.5 text-xs"
                  onClick={() => onEdit(item.id)}
                >
                  <Edit2 className="mr-1.5 h-3 w-3" />
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-none px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="mr-1.5 h-3 w-3" />
                  Supprimer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
