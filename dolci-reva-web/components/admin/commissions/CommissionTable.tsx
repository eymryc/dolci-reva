/**
 * Table des commissions
 * 
 * Utilise le composant DataTable générique pour afficher les commissions
 * avec tri, filtrage et pagination.
 */

"use client";

import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Commission, commissionVerticalLabel } from "@/hooks/use-commissions";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DataTable } from "@/components/admin/shared/DataTable";
import { ActionButtons } from "@/components/admin/shared/ActionButtons";
import { ActiveStatusBadge } from "@/components/admin/shared/ActiveStatusBadge";

interface CommissionTableProps {
  data: Commission[];
  onEdit: (commission: Commission) => void;
  onDelete: (commission: Commission) => void;
  isLoading?: boolean;
  addButton?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CommissionTable({
  data,
  onEdit,
  onDelete,
  isLoading = false,
  addButton,
  onRefresh,
  isRefreshing = false,
}: CommissionTableProps) {
  const columns = useMemo<ColumnDef<Commission>[]>(
    () => [
      {
        accessorKey: "commission",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2 hover:bg-transparent"
            >
              Commission (%)
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const commission = row.getValue("commission");
          const commissionValue = typeof commission === 'number' ? commission : parseFloat(String(commission)) || 0;
          return (
            <div className="font-semibold text-gray-900">
              {commissionValue.toFixed(2)}%
            </div>
          );
        },
      },
      {
        accessorKey: "bookable_type",
        header: "Verticale",
        cell: ({ row }) => {
          const bookableType = row.getValue("bookable_type") as string | null;
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {commissionVerticalLabel(bookableType)}
            </span>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Statut",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return <ActiveStatusBadge active={isActive} />;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const commission = row.original;
          return (
            <ActionButtons
              onEdit={() => onEdit(commission)}
              onDelete={() => onDelete(commission)}
              showDirectButtons={true}
            />
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      addButton={addButton}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      searchPlaceholder="Rechercher par commission (%)..."
      emptyMessage="Aucune donnée"
    />
  );
}
